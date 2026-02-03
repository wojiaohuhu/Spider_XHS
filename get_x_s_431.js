/**
 * 小红书X-S签名生成入口 - 4.3.1版本
 * 基于补环境实现
 * 更新日期: 2026-02
 */

// 必须先加载crypto-js
var CryptoJs = require("crypto-js");

// 加载补环境（包含mnsv2函数）
require('./code1.js');

// Base64编码表
var f = "ZmserbBoHQtNP+wOcza/LpngG8yJq42KWYj0DSfdikx3VT16IlUAFM97hECvuRX5";

function encodeChunk(e, u, l) {
    var d = [];
    for (var s = u; s < l; s += 3) {
        var r = (e[s] << 16 & 0xff0000) + (e[s + 1] << 8 & 65280) + (255 & e[s + 2]);
        d.push(f[r >> 18 & 63] + f[r >> 12 & 63] + f[r >> 6 & 63] + f[63 & r]);
    }
    return d.join("");
}

function encodeUtf8(e) {
    for (var r = encodeURIComponent(e), a = [], i = 0; i < r.length; i++) {
        var c = r.charAt(i);
        if ("%" === c) {
            var d = parseInt(r.charAt(i + 1) + r.charAt(i + 2), 16);
            a.push(d);
            i += 2;
        } else {
            a.push(c.charCodeAt(0));
        }
    }
    return a;
}

function b64Encode(e) {
    var r, a = e.length, c = a % 3, d = [], s = 16383, u = 0, l = a - c;
    for (u = 0; u < l; u += s) {
        d.push(encodeChunk(e, u, u + s > l ? l : u + s));
    }
    if (1 === c) {
        r = e[a - 1];
        d.push(f[r >> 2] + f[r << 4 & 63] + "==");
    } else if (2 === c) {
        r = (e[a - 2] << 8) + e[a - 1];
        d.push(f[r >> 10] + f[r >> 4 & 63] + f[r << 2 & 63] + "=");
    }
    return d.join("");
}

function MD5(e) {
    return CryptoJs.MD5(e).toString();
}

/**
 * 核心签名函数 - 4.3.1版本
 * @param {string} url_param - API路径
 * @param {string|object} json_data - 请求数据
 * @returns {string} X-S签名
 */
function seccore_signv2(url_param, json_data) {
    // 处理json_data
    var dataStr = '';
    if (json_data) {
        if (typeof json_data === 'object') {
            dataStr = JSON.stringify(json_data);
        } else if (typeof json_data === 'string') {
            dataStr = json_data;
        }
    }
    
    // 拼接完整字符串
    var fullStr = url_param + dataStr;
    
    // 计算MD5
    var c = MD5(fullStr);
    var d = MD5(fullStr);
    
    // 调用mnsv2生成签名
    var s = window.mnsv2(fullStr, c, d);
    
    // 构建签名对象
    var signObj = {
        x0: "4.3.1",
        x1: "xhs-pc-web",
        x2: "Windows",
        x3: s,
        x4: "object"
    };
    
    // 返回最终签名
    return "XYS_" + b64Encode(encodeUtf8(JSON.stringify(signObj)));
}

// CRC32计算函数
var gens9 = (function() {
    var a = 0xedb88320;
    var s = [];
    for (var d = 255; d >= 0; d--) {
        var r = d;
        for (var c = 8; c > 0; c--) {
            r = 1 & r ? (r >>> 1) ^ a : r >>> 1;
        }
        s[d] = r >>> 0;
    }
    return function(e) {
        if (typeof e === "string") {
            var c = -1;
            for (var r = 0; r < e.length; ++r) {
                c = s[(255 & c) ^ e.charCodeAt(r)] ^ (c >>> 8);
            }
            return -1 ^ c ^ a;
        }
        var c = -1;
        for (var r = 0; r < e.length; ++r) {
            c = s[(255 & c) ^ e[r]] ^ (c >>> 8);
        }
        return -1 ^ c ^ a;
    };
})();

// xs_common签名数据
var fff = "I38rHdgsjopgIvesdVwgIC+oIELmBZ5e3VwXLgFTIxS3bqwErFeexd0ekncAzMFYnqthIhJeSfMDKutRI3KsYorWHPtGrbV0P9WfIi/eWc6eYqtyQApPI37ekmR6QL+5Ii6sdneeSfqYHqwl2qt5B0DBIx+PGDi/sVtkIxdsxuwr4qtiIhuaIE3e3LV0I3VTIC7e0utl2ADmsLveDSKsSPw5IEvsiVtJOqw8BuwfPpdeTFWOIx4TIiu6ZPwrPut5IvlaLbgs3qtxIxes1VwHIkumIkIyejgsY/WTge7eSqte/D7sDcpipedeYrDtIC6eDVw2IENsSqtlnlSuNjVtIvoekqt3cZ7sVo4gIESyIhE2HBquIxhnqz8gIkIfoqwkICqWGg3sdlOeVPw3IvAe0fged0lGIi5s3Mkf2utAIiKsidvekZNeTPt4nAOeWPwEIvkazA6efuwApfosDqw+I3SrIxE5Luwwaqw+reibqrOeYjgskqtgIkdeYg0exWbxIhgsfMes6jclIkAe3PtTIirdQqwJ8ut9I36e3PtVIiNe1PtlIi5efVwAHutMGqwxI3QUICEeJaPAGl/siqtMIhVtIieeYuwoeWccpj6sDskuIkGyGuwbmPwvICdekVtUQpdeipJs1LELIhvs6ege1VwmrqttIi0sDqtXIENs1SptIi3sfWdeDPw5IxAsVPwx+/GYIEmgIvNs1Y0eV7vsWI==";

function XsCommon(a1, xs, xt) {
    var d = {
        s0: 5,
        s1: "",
        x0: "1",
        x1: "4.3.1",
        x2: "Windows",
        x3: "xhs-pc-web",
        x4: "4.84.1",
        x5: a1,
        x6: xt,
        x7: xs,
        x8: fff,
        x9: gens9(xt.toString() + xs + fff),
        x10: 0,
        x11: "normal",
    };
    var dataStr = JSON.stringify(d);
    return b64Encode(encodeUtf8(dataStr));
}

/**
 * 获取请求头参数 - 主入口函数
 * @param {string} api - API路径
 * @param {string|object} data - 请求数据
 * @param {string} a1 - a1 cookie值
 * @param {string} method - 请求方法，默认POST
 * @returns {object} 包含xs, xt, xs_common的对象
 */
function get_request_headers_params(api, data, a1, method) {
    method = method || "POST";
    
    // 处理data参数
    var payload = data;
    if (typeof data === 'string' && data.trim()) {
        try {
            payload = JSON.parse(data);
        } catch (e) {
            payload = data;
        }
    }
    
    // 生成签名
    var xs = seccore_signv2(api, payload);
    var xt = Date.now();
    var xs_common = XsCommon(a1, xs, xt);
    
    return {
        xs: xs,
        xt: xt,
        xs_common: xs_common
    };
}

// 测试函数
function get_x_s() {
    var url_param = '/api/sns/web/v1/feed';
    var json_data = {
        "source_note_id": "68f88251000000000301d972",
        "image_formats": ["jpg", "webp", "avif"],
        "extra": {"need_body_topic": "1"},
        "xsec_source": "pc_feed",
        "xsec_token": "ABfuVL1abrca5AtSMfNR0pWGBkZh387i3pykPOCHh4QbA="
    };
    var a1 = "1908d1a0b6eb13b5egsm8ggm97q17yfuv92n4l0g850000266761";
    return get_request_headers_params(url_param, json_data, a1, 'POST');
}

// 导出模块
if (typeof module !== "undefined") {
    module.exports = {
        seccore_signv2: seccore_signv2,
        get_request_headers_params: get_request_headers_params,
        XsCommon: XsCommon,
        get_x_s: get_x_s
    };
}

// 测试输出
if (require.main === module) {
    var result = get_x_s();
    console.log('=== X-S签名测试结果 (4.3.1版本) ===');
    console.log('xs:', result.xs);
    console.log('xs长度:', result.xs.length);
    console.log('xt:', result.xt);
    console.log('xs_common长度:', result.xs_common.length);
}
