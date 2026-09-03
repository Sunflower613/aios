/**
 * 治愈调饮吧台 - 轻量离线纯原生二维码生成引擎 (QRCode Generator)
 * 零第三方网络依赖，100% 本地运行，支持将当前网址 (URL) 转换为矢量 / Canvas 矩阵
 * 基于经典 QRCode (Model 2, Byte Mode, ECC Level L/M) 算法
 */

(function(global) {
    // Reed-Solomon 与 GF(256) 算术表
    const EXP_TABLE = new Array(256);
    const LOG_TABLE = new Array(256);
    for (let i = 0, x = 1; i < 256; i++) {
        EXP_TABLE[i] = x;
        LOG_TABLE[x] = i;
        x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
    }

    function glog(n) {
        if (n < 1) throw new Error("glog(" + n + ")");
        return LOG_TABLE[n];
    }
    function gexp(n) {
        while (n < 0) n += 255;
        while (n >= 255) n -= 255;
        return EXP_TABLE[n];
    }

    // 多项式计算
    function Polynomial(num, shift) {
        let offset = 0;
        while (offset < num.length && num[offset] === 0) offset++;
        this.num = new Array(num.length - offset + shift);
        for (let i = 0; i < num.length - offset; i++) this.num[i] = num[i + offset];
        for (let i = num.length - offset; i < this.num.length; i++) this.num[i] = 0;
    }
    Polynomial.prototype = {
        get: function(index) { return this.num[index]; },
        getLength: function() { return this.num.length; },
        multiply: function(e) {
            const num = new Array(this.getLength() + e.getLength() - 1).fill(0);
            for (let i = 0; i < this.getLength(); i++) {
                for (let j = 0; j < e.getLength(); j++) {
                    num[i + j] ^= gexp(glog(this.get(i)) + glog(e.get(j)));
                }
            }
            return new Polynomial(num, 0);
        },
        mod: function(e) {
            if (this.getLength() - e.getLength() < 0) return this;
            const ratio = glog(this.get(0)) - glog(e.get(0));
            const num = new Array(this.getLength());
            for (let i = 0; i < this.getLength(); i++) num[i] = this.get(i);
            for (let i = 0; i < e.getLength(); i++) {
                num[i] ^= gexp(glog(e.get(i)) + ratio);
            }
            return new Polynomial(num, 0).mod(e);
        }
    };

    function getErrorCorrectPolynomial(errorCorrectLength) {
        let a = new Polynomial([1], 0);
        for (let i = 0; i < errorCorrectLength; i++) {
            a = a.multiply(new Polynomial([1, gexp(i)], 0));
        }
        return a;
    }

    // 容量表与纠错块定义 (支持 Version 1 ~ 10, 满足各类长短 URL)
    const RS_BLOCK_TABLE = [
        null,
        // V1 (21x21): 19 字节数据, 7 纠错码字
        [19, 7, 1, 19],
        // V2 (25x25): 34 字节数据, 10 纠错码字
        [34, 10, 1, 34],
        // V3 (29x29): 55 字节数据, 15 纠错码字
        [55, 15, 1, 55],
        // V4 (33x33): 80 字节数据, 20 纠错码字
        [80, 20, 1, 80],
        // V5 (37x37): 108 字节数据, 26 纠错码字
        [108, 26, 1, 108],
        // V6 (41x41): 136 字节数据, 18 纠错码字, 2 块
        [136, 18, 2, 68],
        // V7 (45x45): 156 字节数据, 20 纠错码字, 2 块
        [156, 20, 2, 78],
        // V8 (49x49): 194 字节数据, 24 纠错码字, 2 块
        [194, 24, 2, 97],
        // V9 (53x53): 232 字节数据, 30 纠错码字, 2 块
        [232, 30, 2, 116],
        // V10 (57x57): 274 字节数据, 18 纠错码字, 4 块
        [274, 18, 4, 68]
    ];

    // 对齐图案位置坐标表
    const ALIGNMENT_PATTERN_TABLE = [
        [],
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50]
    ];

    function QRCode(typeNumber, errorCorrectLevel) {
        this.typeNumber = typeNumber;
        this.errorCorrectLevel = errorCorrectLevel || 1; // 1 = L (7% 容错)
        this.modules = null;
        this.moduleCount = 0;
        this.dataCache = null;
        this.dataList = [];
    }

    QRCode.prototype = {
        addData: function(data) {
            this.dataList.push(data);
        },
        isDark: function(row, col) {
            if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
                throw new Error(row + "," + col);
            }
            return this.modules[row][col];
        },
        getModuleCount: function() {
            return this.moduleCount;
        },
        make: function() {
            this.makeImpl(false, this.getBestMaskPattern());
        },
        makeImpl: function(test, maskPattern) {
            this.moduleCount = this.typeNumber * 4 + 17;
            this.modules = new Array(this.moduleCount);
            for (let row = 0; row < this.moduleCount; row++) {
                this.modules[row] = new Array(this.moduleCount).fill(null);
            }
            this.setupPositionProbePattern(0, 0);
            this.setupPositionProbePattern(this.moduleCount - 7, 0);
            this.setupPositionProbePattern(0, this.moduleCount - 7);
            this.setupPositionAdjustPattern();
            this.setupTimingPattern();
            this.setupTypeInfo(test, maskPattern);
            if (this.typeNumber >= 7) {
                this.setupTypeNumber(test);
            }
            if (this.dataCache == null) {
                this.dataCache = QRCode.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
            }
            this.mapData(this.dataCache, maskPattern);
        },
        setupPositionProbePattern: function(row, col) {
            for (let r = -1; r <= 7; r++) {
                if (row + r <= -1 || this.moduleCount <= row + r) continue;
                for (let c = -1; c <= 7; c++) {
                    if (col + c <= -1 || this.moduleCount <= col + c) continue;
                    if ((0 <= r && r <= 6 && (c === 0 || c === 6)) ||
                        (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
                        (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
                        this.modules[row + r][col + c] = true;
                    } else {
                        this.modules[row + r][col + c] = false;
                    }
                }
            }
        },
        getBestMaskPattern: function() {
            let minLostPoint = 0;
            let pattern = 0;
            for (let i = 0; i < 8; i++) {
                this.makeImpl(true, i);
                const lostPoint = QRCode.getLostPoint(this);
                if (i === 0 || minLostPoint > lostPoint) {
                    minLostPoint = lostPoint;
                    pattern = i;
                }
            }
            return pattern;
        },
        setupTimingPattern: function() {
            for (let r = 8; r < this.moduleCount - 8; r++) {
                if (this.modules[r][6] !== null) continue;
                this.modules[r][6] = (r % 2 === 0);
            }
            for (let c = 8; c < this.moduleCount - 8; c++) {
                if (this.modules[6][c] !== null) continue;
                this.modules[6][c] = (c % 2 === 0);
            }
        },
        setupPositionAdjustPattern: function() {
            const pos = ALIGNMENT_PATTERN_TABLE[this.typeNumber];
            for (let i = 0; i < pos.length; i++) {
                for (let j = 0; j < pos.length; j++) {
                    const row = pos[i];
                    const col = pos[j];
                    if (this.modules[row][col] !== null) continue;
                    for (let r = -2; r <= 2; r++) {
                        for (let c = -2; c <= 2; c++) {
                            if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
                                this.modules[row + r][col + c] = true;
                            } else {
                                this.modules[row + r][col + c] = false;
                            }
                        }
                    }
                }
            }
        },
        setupTypeNumber: function(test) {
            const bits = QRCode.getBCHTypeNumber(this.typeNumber);
            for (let i = 0; i < 18; i++) {
                const mod = (!test && ((bits >> i) & 1) === 1);
                this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
                this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
            }
        },
        setupTypeInfo: function(test, maskPattern) {
            const data = (1 << 3) | maskPattern;
            const bits = QRCode.getBCHTypeInfo(data);
            for (let i = 0; i < 15; i++) {
                const mod = (!test && ((bits >> i) & 1) === 1);
                if (i < 6) {
                    this.modules[i][8] = mod;
                } else if (i < 8) {
                    this.modules[i + 1][8] = mod;
                } else {
                    this.modules[this.moduleCount - 15 + i][8] = mod;
                }
                if (i < 8) {
                    this.modules[8][this.moduleCount - i - 1] = mod;
                } else if (i < 9) {
                    this.modules[8][15 - i - 1 + 1] = mod;
                } else {
                    this.modules[8][15 - i - 1] = mod;
                }
            }
            this.modules[this.moduleCount - 8][8] = !test;
        },
        mapData: function(data, maskPattern) {
            let inc = -1;
            let row = this.moduleCount - 1;
            let bitIndex = 7;
            let byteIndex = 0;
            const mask = QRCode.getMask(maskPattern);

            for (let col = this.moduleCount - 1; col > 0; col -= 2) {
                if (col === 6) col--;
                while (true) {
                    for (let c = 0; c < 2; c++) {
                        if (this.modules[row][col - c] === null) {
                            let dark = false;
                            if (byteIndex < data.length) {
                                dark = (((data[byteIndex] >>> bitIndex) & 1) === 1);
                            }
                            if (mask(row, col - c)) {
                                dark = !dark;
                            }
                            this.modules[row][col - c] = dark;
                            bitIndex--;
                            if (bitIndex === -1) {
                                byteIndex++;
                                bitIndex = 7;
                            }
                        }
                    }
                    row += inc;
                    if (row < 0 || this.moduleCount <= row) {
                        row -= inc;
                        inc = -inc;
                        break;
                    }
                }
            }
        }
    };

    // 纠错码与数据块封包
    QRCode.createData = function(typeNumber, errorCorrectLevel, dataList) {
        const rsBlock = RS_BLOCK_TABLE[typeNumber];
        if (!rsBlock) throw new Error("Unsupported typeNumber: " + typeNumber);

        const totalDataCount = rsBlock[0];
        const ecCount = rsBlock[1];
        const numBlocks = rsBlock[2];
        const blockDataCount = rsBlock[3];

        const bytes = [];
        const str = dataList[0];
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            if (code <= 0x7f) {
                bytes.push(code);
            } else if (code <= 0x7ff) {
                bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
            } else {
                bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
            }
        }

        const bitBuffer = [];
        function putBits(num, length) {
            for (let i = 0; i < length; i++) {
                bitBuffer.push(((num >>> (length - i - 1)) & 1) === 1);
            }
        }
        putBits(4, 4); // 8-bit Byte Mode
        putBits(bytes.length, typeNumber < 10 ? 8 : 16);
        for (let i = 0; i < bytes.length; i++) {
            putBits(bytes[i], 8);
        }

        for (let i = 0; i < 4 && bitBuffer.length < totalDataCount * 8; i++) {
            bitBuffer.push(false);
        }
        while (bitBuffer.length % 8 !== 0) {
            bitBuffer.push(false);
        }
        const padBytes = [0xec, 0x11];
        let padIdx = 0;
        while (bitBuffer.length < totalDataCount * 8) {
            putBits(padBytes[padIdx % 2], 8);
            padIdx++;
        }

        const dataBytes = new Array(totalDataCount);
        for (let i = 0; i < totalDataCount; i++) {
            let b = 0;
            for (let j = 0; j < 8; j++) {
                if (bitBuffer[i * 8 + j]) b |= (1 << (7 - j));
            }
            dataBytes[i] = b;
        }

        const rawBlocks = [];
        let offset = 0;
        for (let b = 0; b < numBlocks; b++) {
            const rawBlock = dataBytes.slice(offset, offset + blockDataCount);
            offset += blockDataCount;
            const rsPoly = getErrorCorrectPolynomial(ecCount);
            const rawPoly = new Polynomial(rawBlock, rsPoly.getLength() - 1);
            const modPoly = rawPoly.mod(rsPoly);
            const ecData = new Array(rsPoly.getLength() - 1);
            for (let i = 0; i < ecData.length; i++) {
                const modIndex = i + modPoly.getLength() - ecData.length;
                ecData[i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
            }
            rawBlocks.push({ data: rawBlock, ec: ecData });
        }

        const result = [];
        for (let i = 0; i < blockDataCount; i++) {
            for (let b = 0; b < numBlocks; b++) {
                if (i < rawBlocks[b].data.length) result.push(rawBlocks[b].data[i]);
            }
        }
        for (let i = 0; i < ecCount; i++) {
            for (let b = 0; b < numBlocks; b++) {
                if (i < rawBlocks[b].ec.length) result.push(rawBlocks[b].ec[i]);
            }
        }
        return result;
    };

    QRCode.getMask = function(maskPattern) {
        switch (maskPattern) {
            case 0: return (r, c) => (r + c) % 2 === 0;
            case 1: return (r, c) => r % 2 === 0;
            case 2: return (r, c) => c % 3 === 0;
            case 3: return (r, c) => (r + c) % 3 === 0;
            case 4: return (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
            case 5: return (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0;
            case 6: return (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
            case 7: return (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
            default: return () => false;
        }
    };

    QRCode.getLostPoint = function(qrCode) {
        const count = qrCode.getModuleCount();
        let lostPoint = 0;
        for (let row = 0; row < count; row++) {
            for (let col = 0; col < count; col++) {
                let sameCount = 0;
                const dark = qrCode.isDark(row, col);
                for (let r = -1; r <= 1; r++) {
                    if (row + r < 0 || count <= row + r) continue;
                    for (let c = -1; c <= 1; c++) {
                        if (col + c < 0 || count <= col + c) continue;
                        if (r === 0 && c === 0) continue;
                        if (dark === qrCode.isDark(row + r, col + c)) sameCount++;
                    }
                }
                if (sameCount > 5) lostPoint += (3 + sameCount - 5);
            }
        }
        return lostPoint;
    };

    QRCode.getBCHTypeInfo = function(data) {
        let d = data << 10;
        while (QRCode.getBCHDigit(d) - QRCode.getBCHDigit(1335) >= 0) {
            d ^= (1335 << (QRCode.getBCHDigit(d) - QRCode.getBCHDigit(1335)));
        }
        return ((data << 10) | d) ^ 21522;
    };

    QRCode.getBCHTypeNumber = function(data) {
        let d = data << 12;
        while (QRCode.getBCHDigit(d) - QRCode.getBCHDigit(7973) >= 0) {
            d ^= (7973 << (QRCode.getBCHDigit(d) - QRCode.getBCHDigit(7973)));
        }
        return (data << 12) | d;
    };

    QRCode.getBCHDigit = function(data) {
        let digit = 0;
        while (data !== 0) {
            digit++;
            data >>>= 1;
        }
        return digit;
    };

    // 顶层导出工具 API
    const QRCodeEngine = {
        generate: function(text) {
            const byteLen = encodeURIComponent(text).replace(/%[A-F\d]{2}/g, 'U').length;
            let version = 1;
            for (let v = 1; v <= 10; v++) {
                if (RS_BLOCK_TABLE[v] && RS_BLOCK_TABLE[v][0] - 3 >= byteLen) {
                    version = v;
                    break;
                }
            }
            const qr = new QRCode(version, 1);
            qr.addData(text);
            qr.make();
            return qr;
        },

        // 在 HTML / 离线 Canvas 上绘制指定大小的二维码
        drawToCanvas: function(canvas, text, options) {
            options = options || {};
            const margin = options.margin !== undefined ? options.margin : 2;
            const darkColor = options.darkColor || "#2c221a";
            const lightColor = options.lightColor || "#ffffff";
            const qr = this.generate(text);
            const count = qr.getModuleCount();
            const totalModules = count + margin * 2;
            const size = options.size || canvas.width || 120;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            const cellSize = size / totalModules;

            ctx.fillStyle = lightColor;
            ctx.fillRect(0, 0, size, size);

            ctx.fillStyle = darkColor;
            for (let r = 0; r < count; r++) {
                for (let c = 0; c < count; c++) {
                    if (qr.isDark(r, c)) {
                        ctx.fillRect(
                            Math.round((c + margin) * cellSize),
                            Math.round((r + margin) * cellSize),
                            Math.ceil(cellSize),
                            Math.ceil(cellSize)
                        );
                    }
                }
            }
            return canvas;
        }
    };

    global.QRCodeEngine = QRCodeEngine;
    if (typeof module !== "undefined" && module.exports) {
        module.exports = QRCodeEngine;
    }
})(typeof window !== "undefined" ? window : global);
