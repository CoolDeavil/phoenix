/**
 * // MODIFICATION
 * https://github.com/galerija/toascii-js
 *
 * This is a modification of fold-to-ascii.js (https://github.com/mplatt/fold-to-ascii-js).
 * Original (fold-to-ascii) functions were combined into a new string method.
 * Beside that characters database was limited to lowercase characters only
 * and lower/uppercase transformation is used instead.
 * All credit goes to the original author.
 *
 * // USAGE
 * Use as any other function: toAscii(string);
 *
 * // ORIGINAL LICENSE AND INFO
 * fold-to-ascii.js
 * https://github.com/mplatt/fold-to-ascii-js
 *
 * This is a JavaScript port of the Apache Lucene ASCII Folding Filter.
 *
 * The Apache Lucene ASCII Folding Filter is licensed to the Apache Software
 * Foundation (ASF) under one or more contributor license agreements. See the
 * NOTICE file distributed with this work for additional information regarding
 * copyright ownership. The ASF licenses this file to You under the Apache
 * License, Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * This port uses an example from the Mozilla Developer Network published prior
 * to August 20, 2010
 *
 * fixedCharCodeAt is licencesed under the MIT License (MIT)
 *
 * Copyright (c) 2013 Mozilla Developer Network and individual contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export default function toAscii (string:string) {
    // DEFAULT CHARACTER REPLACEMENT
    // let defaultString = "_";
    // let replaceUnmapped = true;

    if (string === null) {return "";}

    let outStr:string = "";

    for (let i = 0; i < string.length; i++) {

        let letter = string.charAt(i);
        let upper = false;
        if (letter === letter.toUpperCase() && letter !== letter.toLowerCase()){
            upper = true;
        }

        i = i || 0;
        let code = string.toLowerCase().charCodeAt(i);
        let hi, low;

        if (0xD800 <= code && code <= 0xDBFF) {
            hi = code;
            low = string.toLowerCase().charCodeAt(i + 1);
            if (isNaN(low)) {
                throw 'High surrogate not followed by low surrogate in fixedCharCodeAt()';
            }
            return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
        }
        if (0xDC00 <= code && code <= 0xDFFF) {
            /*
             * Low surrogate: We return false to allow loops to skip this
             * iteration since should have already handled high surrogate above
             * in the previous iteration
             */
            return false;
        }
        let charCode = code;

        if (charCode) {
            if (charCode < 128) {
                // character is latin -> keep it
                outStr += upper ? String.fromCharCode(charCode).toUpperCase() : String.fromCharCode(charCode);
            } else {
                let replacement;
                // change character
                switch (charCode) {
                    case 0xE0: // ??	[LATIN SMALL LETTER A WITH GRAVE]
                    case 0xE1: // ??	[LATIN SMALL LETTER A WITH ACUTE]
                    case 0xE2: // ??	[LATIN SMALL LETTER A WITH CIRCUMFLEX]
                    case 0xE3: // ??	[LATIN SMALL LETTER A WITH TILDE]
                    case 0xE4: // ??	[LATIN SMALL LETTER A WITH DIAERESIS]
                    case 0xE5: // ??	[LATIN SMALL LETTER A WITH RING ABOVE]
                    case 0x101: // ??	[LATIN SMALL LETTER A WITH MACRON]
                    case 0x103: // ??	[LATIN SMALL LETTER A WITH BREVE]
                    case 0x105: // ??	[LATIN SMALL LETTER A WITH OGONEK]
                    case 0x1CE: // ??	[LATIN SMALL LETTER A WITH CARON]
                    case 0x1DF: // ??	[LATIN SMALL LETTER A WITH DIAERESIS AND MACRON]
                    case 0x1E1: // ??	[LATIN SMALL LETTER A WITH DOT ABOVE AND MACRON]
                    case 0x1FB: // ??	[LATIN SMALL LETTER A WITH RING ABOVE AND ACUTE]
                    case 0x201: // ??	[LATIN SMALL LETTER A WITH DOUBLE GRAVE]
                    case 0x203: // ??	[LATIN SMALL LETTER A WITH INVERTED BREVE]
                    case 0x227: // ??	[LATIN SMALL LETTER A WITH DOT ABOVE]
                    case 0x250: // ??	[LATIN SMALL LETTER TURNED A]
                    case 0x259: // ??	[LATIN SMALL LETTER SCHWA]
                    case 0x25A: // ??	[LATIN SMALL LETTER SCHWA WITH HOOK]
                    case 0x1D8F: // ???	[LATIN SMALL LETTER A WITH RETROFLEX HOOK]
                    case 0x1D95: // ???	[LATIN SMALL LETTER SCHWA WITH RETROFLEX HOOK]
                    case 0x1E01: // ???	[LATIN SMALL LETTER A WITH RING BELOW]
                    case 0x1E9A: // ???	[LATIN SMALL LETTER A WITH RIGHT HALF RING]
                    case 0x1EA1: // ???	[LATIN SMALL LETTER A WITH DOT BELOW]
                    case 0x1EA3: // ???	[LATIN SMALL LETTER A WITH HOOK ABOVE]
                    case 0x1EA5: // ???	[LATIN SMALL LETTER A WITH CIRCUMFLEX AND ACUTE]
                    case 0x1EA7: // ???	[LATIN SMALL LETTER A WITH CIRCUMFLEX AND GRAVE]
                    case 0x1EA9: // ???	[LATIN SMALL LETTER A WITH CIRCUMFLEX AND HOOK ABOVE]
                    case 0x1EAB: // ???	[LATIN SMALL LETTER A WITH CIRCUMFLEX AND TILDE]
                    case 0x1EAD: // ???	[LATIN SMALL LETTER A WITH CIRCUMFLEX AND DOT BELOW]
                    case 0x1EAF: // ???	[LATIN SMALL LETTER A WITH BREVE AND ACUTE]
                    case 0x1EB1: // ???	[LATIN SMALL LETTER A WITH BREVE AND GRAVE]
                    case 0x1EB3: // ???	[LATIN SMALL LETTER A WITH BREVE AND HOOK ABOVE]
                    case 0x1EB5: // ???	[LATIN SMALL LETTER A WITH BREVE AND TILDE]
                    case 0x1EB7: // ???	[LATIN SMALL LETTER A WITH BREVE AND DOT BELOW]
                    case 0x2090: // ???	[LATIN SUBSCRIPT SMALL LETTER A]
                    case 0x2094: // ???	[LATIN SUBSCRIPT SMALL LETTER SCHWA]
                    case 0x24D0: // ???	[CIRCLED LATIN SMALL LETTER A]
                    case 0x2C65: // ???	[LATIN SMALL LETTER A WITH STROKE]
                    case 0x2C6F: // ???	[LATIN CAPITAL LETTER TURNED A]
                    case 0xFF41: // ???	[FULLWIDTH LATIN SMALL LETTER A]
                        replacement = "a";
                        break;
                    case 0x180: // ??	[LATIN SMALL LETTER B WITH STROKE]
                    case 0x183: // ??	[LATIN SMALL LETTER B WITH TOPBAR]
                    case 0x253: // ??	[LATIN SMALL LETTER B WITH HOOK]
                    case 0x1D6C: // ???	[LATIN SMALL LETTER B WITH MIDDLE TILDE]
                    case 0x1D80: // ???	[LATIN SMALL LETTER B WITH PALATAL HOOK]
                    case 0x1E03: // ???	[LATIN SMALL LETTER B WITH DOT ABOVE]
                    case 0x1E05: // ???	[LATIN SMALL LETTER B WITH DOT BELOW]
                    case 0x1E07: // ???	[LATIN SMALL LETTER B WITH LINE BELOW]
                    case 0x24D1: // ???	[CIRCLED LATIN SMALL LETTER B]
                    case 0xFF42: // ???	[FULLWIDTH LATIN SMALL LETTER B]
                        replacement = "b";
                        break;
                    case 0xE7: // ??	[LATIN SMALL LETTER C WITH CEDILLA]
                    case 0x107: // ??	[LATIN SMALL LETTER C WITH ACUTE]
                    case 0x109: // ??	[LATIN SMALL LETTER C WITH CIRCUMFLEX]
                    case 0x10B: // ??	[LATIN SMALL LETTER C WITH DOT ABOVE]
                    case 0x10D: // ??	[LATIN SMALL LETTER C WITH CARON]
                    case 0x188: // ??	[LATIN SMALL LETTER C WITH HOOK]
                    case 0x23C: // ??	[LATIN SMALL LETTER C WITH STROKE]
                    case 0x255: // ??	[LATIN SMALL LETTER C WITH CURL]
                    case 0x1E09: // ???	[LATIN SMALL LETTER C WITH CEDILLA AND ACUTE]
                    case 0x2184: // ???	[LATIN SMALL LETTER REVERSED C]
                    case 0x24D2: // ???	[CIRCLED LATIN SMALL LETTER C]
                    case 0xA73E: // ???	[LATIN CAPITAL LETTER REVERSED C WITH DOT]
                    case 0xA73F: // ???	[LATIN SMALL LETTER REVERSED C WITH DOT]
                    case 0xFF43: // ???	[FULLWIDTH LATIN SMALL LETTER C]
                        replacement = "c";
                        break;
                    case 0xF0: // ??	[LATIN SMALL LETTER ETH]
                    case 0x10F: // ??	[LATIN SMALL LETTER D WITH CARON]
                    case 0x111: // ??	[LATIN SMALL LETTER D WITH STROKE]
                    case 0x18C: // ??	[LATIN SMALL LETTER D WITH TOPBAR]
                    case 0x221: // ??	[LATIN SMALL LETTER D WITH CURL]
                    case 0x256: // ??	[LATIN SMALL LETTER D WITH TAIL]
                    case 0x257: // ??	[LATIN SMALL LETTER D WITH HOOK]
                    case 0x1D6D: // ???	[LATIN SMALL LETTER D WITH MIDDLE TILDE]
                    case 0x1D81: // ???	[LATIN SMALL LETTER D WITH PALATAL HOOK]
                    case 0x1D91: // ???	[LATIN SMALL LETTER D WITH HOOK AND TAIL]
                    case 0x1E0B: // ???	[LATIN SMALL LETTER D WITH DOT ABOVE]
                    case 0x1E0D: // ???	[LATIN SMALL LETTER D WITH DOT BELOW]
                    case 0x1E0F: // ???	[LATIN SMALL LETTER D WITH LINE BELOW]
                    case 0x1E11: // ???	[LATIN SMALL LETTER D WITH CEDILLA]
                    case 0x1E13: // ???	[LATIN SMALL LETTER D WITH CIRCUMFLEX BELOW]
                    case 0x24D3: // ???	[CIRCLED LATIN SMALL LETTER D]
                    case 0xA77A: // ???	[LATIN SMALL LETTER INSULAR D]
                    case 0xFF44: // ???	[FULLWIDTH LATIN SMALL LETTER D]
                        replacement = "d";
                        break;
                    case 0x1C6: // ??	[LATIN SMALL LETTER DZ WITH CARON]
                    case 0x1F3: // ??	[LATIN SMALL LETTER DZ]
                    case 0x2A3: // ??	[LATIN SMALL LETTER DZ DIGRAPH]
                    case 0x2A5: // ??	[LATIN SMALL LETTER DZ DIGRAPH WITH CURL]
                        replacement = "dz";
                        break;
                    case 0xE8: // ??	[LATIN SMALL LETTER E WITH GRAVE]
                    case 0xE9: // ??	[LATIN SMALL LETTER E WITH ACUTE]
                    case 0xEA: // ??	[LATIN SMALL LETTER E WITH CIRCUMFLEX]
                    case 0xEB: // ??	[LATIN SMALL LETTER E WITH DIAERESIS]
                    case 0x113: // ??	[LATIN SMALL LETTER E WITH MACRON]
                    case 0x115: // ??	[LATIN SMALL LETTER E WITH BREVE]
                    case 0x117: // ??	[LATIN SMALL LETTER E WITH DOT ABOVE]
                    case 0x119: // ??	[LATIN SMALL LETTER E WITH OGONEK]
                    case 0x11B: // ??	[LATIN SMALL LETTER E WITH CARON]
                    case 0x1DD: // ??	[LATIN SMALL LETTER TURNED E]
                    case 0x205: // ??	[LATIN SMALL LETTER E WITH DOUBLE GRAVE]
                    case 0x207: // ??	[LATIN SMALL LETTER E WITH INVERTED BREVE]
                    case 0x229: // ??	[LATIN SMALL LETTER E WITH CEDILLA]
                    case 0x247: // ??	[LATIN SMALL LETTER E WITH STROKE]
                    case 0x258: // ??	[LATIN SMALL LETTER REVERSED E]
                    case 0x25B: // ??	[LATIN SMALL LETTER OPEN E]
                    case 0x25C: // ??	[LATIN SMALL LETTER REVERSED OPEN E]
                    case 0x25D: // ??	[LATIN SMALL LETTER REVERSED OPEN E WITH HOOK]
                    case 0x25E: // ??	[LATIN SMALL LETTER CLOSED REVERSED OPEN E]
                    case 0x29A: // ??	[LATIN SMALL LETTER CLOSED OPEN E]
                    case 0x1D08: // ???	[LATIN SMALL LETTER TURNED OPEN E]
                    case 0x1D92: // ???	[LATIN SMALL LETTER E WITH RETROFLEX HOOK]
                    case 0x1D93: // ???	[LATIN SMALL LETTER OPEN E WITH RETROFLEX HOOK]
                    case 0x1D94: // ???	[LATIN SMALL LETTER REVERSED OPEN E WITH RETROFLEX HOOK]
                    case 0x1E15: // ???	[LATIN SMALL LETTER E WITH MACRON AND GRAVE]
                    case 0x1E17: // ???	[LATIN SMALL LETTER E WITH MACRON AND ACUTE]
                    case 0x1E19: // ???	[LATIN SMALL LETTER E WITH CIRCUMFLEX BELOW]
                    case 0x1E1B: // ???	[LATIN SMALL LETTER E WITH TILDE BELOW]
                    case 0x1E1D: // ???	[LATIN SMALL LETTER E WITH CEDILLA AND BREVE]
                    case 0x1EB9: // ???	[LATIN SMALL LETTER E WITH DOT BELOW]
                    case 0x1EBB: // ???	[LATIN SMALL LETTER E WITH HOOK ABOVE]
                    case 0x1EBD: // ???	[LATIN SMALL LETTER E WITH TILDE]
                    case 0x1EBF: // ???	[LATIN SMALL LETTER E WITH CIRCUMFLEX AND ACUTE]
                    case 0x1EC1: // ???	[LATIN SMALL LETTER E WITH CIRCUMFLEX AND GRAVE]
                    case 0x1EC3: // ???	[LATIN SMALL LETTER E WITH CIRCUMFLEX AND HOOK ABOVE]
                    case 0x1EC5: // ???	[LATIN SMALL LETTER E WITH CIRCUMFLEX AND TILDE]
                    case 0x1EC7: // ???	[LATIN SMALL LETTER E WITH CIRCUMFLEX AND DOT BELOW]
                    case 0x2091: // ???	[LATIN SUBSCRIPT SMALL LETTER E]
                    case 0x24D4: // ???	[CIRCLED LATIN SMALL LETTER E]
                    case 0x2C78: // ???	[LATIN SMALL LETTER E WITH NOTCH]
                    case 0xFF45: // ???	[FULLWIDTH LATIN SMALL LETTER E]
                        replacement = "e";
                        break;
                    case 0x192: // ??	[LATIN SMALL LETTER F WITH HOOK]
                    case 0x1D6E: // ???	[LATIN SMALL LETTER F WITH MIDDLE TILDE]
                    case 0x1D82: // ???	[LATIN SMALL LETTER F WITH PALATAL HOOK]
                    case 0x1E1F: // ???	[LATIN SMALL LETTER F WITH DOT ABOVE]
                    case 0x1E9B: // ???	[LATIN SMALL LETTER LONG S WITH DOT ABOVE]
                    case 0x24D5: // ???	[CIRCLED LATIN SMALL LETTER F]
                    case 0xA77C: // ???	[LATIN SMALL LETTER INSULAR F]
                    case 0xFF46: // ???	[FULLWIDTH LATIN SMALL LETTER F]
                        replacement = "f";
                        break;
                    case 0x11D: // ??	[LATIN SMALL LETTER G WITH CIRCUMFLEX]
                    case 0x11F: // ??	[LATIN SMALL LETTER G WITH BREVE]
                    case 0x121: // ??	[LATIN SMALL LETTER G WITH DOT ABOVE]
                    case 0x123: // ??	[LATIN SMALL LETTER G WITH CEDILLA]
                    case 0x1F5: // ??	[LATIN SMALL LETTER G WITH ACUTE]
                    case 0x260: // ??	[LATIN SMALL LETTER G WITH HOOK]
                    case 0x261: // ??	[LATIN SMALL LETTER SCRIPT G]
                    case 0x1D77: // ???	[LATIN SMALL LETTER TURNED G]
                    case 0x1D79: // ???	[LATIN SMALL LETTER INSULAR G]
                    case 0x1D83: // ???	[LATIN SMALL LETTER G WITH PALATAL HOOK]
                    case 0x1E21: // ???	[LATIN SMALL LETTER G WITH MACRON]
                    case 0x24D6: // ???	[CIRCLED LATIN SMALL LETTER G]
                    case 0xA77F: // ???	[LATIN SMALL LETTER TURNED INSULAR G]
                    case 0xFF47: // ???	[FULLWIDTH LATIN SMALL LETTER G]
                        replacement = "g";
                        break;
                    case 0x125: // ??	[LATIN SMALL LETTER H WITH CIRCUMFLEX]
                    case 0x127: // ??	[LATIN SMALL LETTER H WITH STROKE]
                    case 0x21F: // ??	[LATIN SMALL LETTER H WITH CARON]
                    case 0x265: // ??	[LATIN SMALL LETTER TURNED H]
                    case 0x266: // ??	[LATIN SMALL LETTER H WITH HOOK]
                    case 0x2AE: // ??	[LATIN SMALL LETTER TURNED H WITH FISHHOOK]
                    case 0x2AF: // ??	[LATIN SMALL LETTER TURNED H WITH FISHHOOK AND TAIL]
                    case 0x1E23: // ???	[LATIN SMALL LETTER H WITH DOT ABOVE]
                    case 0x1E25: // ???	[LATIN SMALL LETTER H WITH DOT BELOW]
                    case 0x1E27: // ???	[LATIN SMALL LETTER H WITH DIAERESIS]
                    case 0x1E29: // ???	[LATIN SMALL LETTER H WITH CEDILLA]
                    case 0x1E2B: // ???	[LATIN SMALL LETTER H WITH BREVE BELOW]
                    case 0x1E96: // ???	[LATIN SMALL LETTER H WITH LINE BELOW]
                    case 0x24D7: // ???	[CIRCLED LATIN SMALL LETTER H]
                    case 0x2C68: // ???	[LATIN SMALL LETTER H WITH DESCENDER]
                    case 0x2C76: // ???	[LATIN SMALL LETTER HALF H]
                    case 0xFF48: // ???	[FULLWIDTH LATIN SMALL LETTER H]
                        replacement = "h";
                        break;
                    case 0xEC: // ??	[LATIN SMALL LETTER I WITH GRAVE]
                    case 0xED: // ??	[LATIN SMALL LETTER I WITH ACUTE]
                    case 0xEE: // ??	[LATIN SMALL LETTER I WITH CIRCUMFLEX]
                    case 0xEF: // ??	[LATIN SMALL LETTER I WITH DIAERESIS]
                    case 0x129: // ??	[LATIN SMALL LETTER I WITH TILDE]
                    case 0x12B: // ??	[LATIN SMALL LETTER I WITH MACRON]
                    case 0x12D: // ??	[LATIN SMALL LETTER I WITH BREVE]
                    case 0x12F: // ??	[LATIN SMALL LETTER I WITH OGONEK]
                    case 0x131: // ??	[LATIN SMALL LETTER DOTLESS I]
                    case 0x1D0: // ??	[LATIN SMALL LETTER I WITH CARON]
                    case 0x209: // ??	[LATIN SMALL LETTER I WITH DOUBLE GRAVE]
                    case 0x20B: // ??	[LATIN SMALL LETTER I WITH INVERTED BREVE]
                    case 0x268: // ??	[LATIN SMALL LETTER I WITH STROKE]
                    case 0x1D09: // ???	[LATIN SMALL LETTER TURNED I]
                    case 0x1D62: // ???	[LATIN SUBSCRIPT SMALL LETTER I]
                    case 0x1D7C: // ???	[LATIN SMALL LETTER IOTA WITH STROKE]
                    case 0x1D96: // ???	[LATIN SMALL LETTER I WITH RETROFLEX HOOK]
                    case 0x1E2D: // ???	[LATIN SMALL LETTER I WITH TILDE BELOW]
                    case 0x1E2F: // ???	[LATIN SMALL LETTER I WITH DIAERESIS AND ACUTE]
                    case 0x1EC9: // ???	[LATIN SMALL LETTER I WITH HOOK ABOVE]
                    case 0x1ECB: // ???	[LATIN SMALL LETTER I WITH DOT BELOW]
                    case 0x2071: // ???	[SUPERSCRIPT LATIN SMALL LETTER I]
                    case 0x24D8: // ???	[CIRCLED LATIN SMALL LETTER I]
                    case 0xFF49: // ???	[FULLWIDTH LATIN SMALL LETTER I]
                        replacement = "i";
                        break;
                    case 0x135: // ??	[LATIN SMALL LETTER J WITH CIRCUMFLEX]
                    case 0x1F0: // ??	[LATIN SMALL LETTER J WITH CARON]
                    case 0x237: // ??	[LATIN SMALL LETTER DOTLESS J]
                    case 0x249: // ??	[LATIN SMALL LETTER J WITH STROKE]
                    case 0x25F: // ??	[LATIN SMALL LETTER DOTLESS J WITH STROKE]
                    case 0x284: // ??	[LATIN SMALL LETTER DOTLESS J WITH STROKE AND HOOK]
                    case 0x29D: // ??	[LATIN SMALL LETTER J WITH CROSSED-TAIL]
                    case 0x24D9: // ???	[CIRCLED LATIN SMALL LETTER J]
                    case 0x2C7C: // ???	[LATIN SUBSCRIPT SMALL LETTER J]
                    case 0xFF4A: // ???	[FULLWIDTH LATIN SMALL LETTER J]
                        replacement = "j";
                        break;
                    case 0x137: // ??	[LATIN SMALL LETTER K WITH CEDILLA]
                    case 0x199: // ??	[LATIN SMALL LETTER K WITH HOOK]
                    case 0x1E9: // ??	[LATIN SMALL LETTER K WITH CARON]
                    case 0x29E: // ??	[LATIN SMALL LETTER TURNED K]
                    case 0x1D84: // ???	[LATIN SMALL LETTER K WITH PALATAL HOOK]
                    case 0x1E31: // ???	[LATIN SMALL LETTER K WITH ACUTE]
                    case 0x1E33: // ???	[LATIN SMALL LETTER K WITH DOT BELOW]
                    case 0x1E35: // ???	[LATIN SMALL LETTER K WITH LINE BELOW]
                    case 0x24DA: // ???	[CIRCLED LATIN SMALL LETTER K]
                    case 0x2C6A: // ???	[LATIN SMALL LETTER K WITH DESCENDER]
                    case 0xA741: // ???	[LATIN SMALL LETTER K WITH STROKE]
                    case 0xA743: // ???	[LATIN SMALL LETTER K WITH DIAGONAL STROKE]
                    case 0xA745: // ???	[LATIN SMALL LETTER K WITH STROKE AND DIAGONAL STROKE]
                    case 0xFF4B: // ???	[FULLWIDTH LATIN SMALL LETTER K]
                        replacement = "k";
                        break;
                    case 0x13A: // ??	[LATIN SMALL LETTER L WITH ACUTE]
                    case 0x13C: // ??	[LATIN SMALL LETTER L WITH CEDILLA]
                    case 0x13E: // ??	[LATIN SMALL LETTER L WITH CARON]
                    case 0x140: // ??	[LATIN SMALL LETTER L WITH MIDDLE DOT]
                    case 0x142: // ??	[LATIN SMALL LETTER L WITH STROKE]
                    case 0x19A: // ??	[LATIN SMALL LETTER L WITH BAR]
                    case 0x234: // ??	[LATIN SMALL LETTER L WITH CURL]
                    case 0x26B: // ??	[LATIN SMALL LETTER L WITH MIDDLE TILDE]
                    case 0x26C: // ??	[LATIN SMALL LETTER L WITH BELT]
                    case 0x26D: // ??	[LATIN SMALL LETTER L WITH RETROFLEX HOOK]
                    case 0x1D85: // ???	[LATIN SMALL LETTER L WITH PALATAL HOOK]
                    case 0x1E37: // ???	[LATIN SMALL LETTER L WITH DOT BELOW]
                    case 0x1E39: // ???	[LATIN SMALL LETTER L WITH DOT BELOW AND MACRON]
                    case 0x1E3B: // ???	[LATIN SMALL LETTER L WITH LINE BELOW]
                    case 0x1E3D: // ???	[LATIN SMALL LETTER L WITH CIRCUMFLEX BELOW]
                    case 0x24DB: // ???	[CIRCLED LATIN SMALL LETTER L]
                    case 0x2C61: // ???	[LATIN SMALL LETTER L WITH DOUBLE BAR]
                    case 0xA747: // ???	[LATIN SMALL LETTER BROKEN L]
                    case 0xA749: // ???	[LATIN SMALL LETTER L WITH HIGH STROKE]
                    case 0xA781: // ???	[LATIN SMALL LETTER TURNED L]
                    case 0xFF4C: // ???	[FULLWIDTH LATIN SMALL LETTER L]
                        replacement = "l";
                        break;
                    case 0x26F: // ??	[LATIN SMALL LETTER TURNED M]
                    case 0x270: // ??	[LATIN SMALL LETTER TURNED M WITH LONG LEG]
                    case 0x271: // ??	[LATIN SMALL LETTER M WITH HOOK]
                    case 0x1D6F: // ???	[LATIN SMALL LETTER M WITH MIDDLE TILDE]
                    case 0x1D86: // ???	[LATIN SMALL LETTER M WITH PALATAL HOOK]
                    case 0x1E3F: // ???	[LATIN SMALL LETTER M WITH ACUTE]
                    case 0x1E41: // ???	[LATIN SMALL LETTER M WITH DOT ABOVE]
                    case 0x1E43: // ???	[LATIN SMALL LETTER M WITH DOT BELOW]
                    case 0x24DC: // ???	[CIRCLED LATIN SMALL LETTER M]
                    case 0xFF4D: // ???	[FULLWIDTH LATIN SMALL LETTER M]
                        replacement = "m";
                        break;
                    case 0xF1: // ??	[LATIN SMALL LETTER N WITH TILDE]
                    case 0x144: // ??	[LATIN SMALL LETTER N WITH ACUTE]
                    case 0x146: // ??	[LATIN SMALL LETTER N WITH CEDILLA]
                    case 0x148: // ??	[LATIN SMALL LETTER N WITH CARON]
                    case 0x149: // ??	[LATIN SMALL LETTER N PRECEDED BY APOSTROPHE]
                    case 0x14B: // ??	http;//en.wikipedia.org/wiki/Eng_(letter)	[LATIN SMALL LETTER ENG]
                    case 0x19E: // ??	[LATIN SMALL LETTER N WITH LONG RIGHT LEG]
                    case 0x1F9: // ??	[LATIN SMALL LETTER N WITH GRAVE]
                    case 0x235: // ??	[LATIN SMALL LETTER N WITH CURL]
                    case 0x272: // ??	[LATIN SMALL LETTER N WITH LEFT HOOK]
                    case 0x273: // ??	[LATIN SMALL LETTER N WITH RETROFLEX HOOK]
                    case 0x1D70: // ???	[LATIN SMALL LETTER N WITH MIDDLE TILDE]
                    case 0x1D87: // ???	[LATIN SMALL LETTER N WITH PALATAL HOOK]
                    case 0x1E45: // ???	[LATIN SMALL LETTER N WITH DOT ABOVE]
                    case 0x1E47: // ???	[LATIN SMALL LETTER N WITH DOT BELOW]
                    case 0x1E49: // ???	[LATIN SMALL LETTER N WITH LINE BELOW]
                    case 0x1E4B: // ???	[LATIN SMALL LETTER N WITH CIRCUMFLEX BELOW]
                    case 0x207F: // ???	[SUPERSCRIPT LATIN SMALL LETTER N]
                    case 0x24DD: // ???	[CIRCLED LATIN SMALL LETTER N]
                    case 0xFF4E: // ???	[FULLWIDTH LATIN SMALL LETTER N]
                        replacement = "n";
                        break;
                    case 0xF2: // ??	[LATIN SMALL LETTER O WITH GRAVE]
                    case 0xF3: // ??	[LATIN SMALL LETTER O WITH ACUTE]
                    case 0xF4: // ??	[LATIN SMALL LETTER O WITH CIRCUMFLEX]
                    case 0xF5: // ??	[LATIN SMALL LETTER O WITH TILDE]
                    case 0xF6: // ??	[LATIN SMALL LETTER O WITH DIAERESIS]
                    case 0xF8: // ??	[LATIN SMALL LETTER O WITH STROKE]
                    case 0x14D: // ??	[LATIN SMALL LETTER O WITH MACRON]
                    case 0x14F: // ??	[LATIN SMALL LETTER O WITH BREVE]
                    case 0x151: // ??	[LATIN SMALL LETTER O WITH DOUBLE ACUTE]
                    case 0x1A1: // ??	[LATIN SMALL LETTER O WITH HORN]
                    case 0x1D2: // ??	[LATIN SMALL LETTER O WITH CARON]
                    case 0x1EB: // ??	[LATIN SMALL LETTER O WITH OGONEK]
                    case 0x1ED: // ??	[LATIN SMALL LETTER O WITH OGONEK AND MACRON]
                    case 0x1FF: // ??	[LATIN SMALL LETTER O WITH STROKE AND ACUTE]
                    case 0x20D: // ??	[LATIN SMALL LETTER O WITH DOUBLE GRAVE]
                    case 0x20F: // ??	[LATIN SMALL LETTER O WITH INVERTED BREVE]
                    case 0x22B: // ??	[LATIN SMALL LETTER O WITH DIAERESIS AND MACRON]
                    case 0x22D: // ??	[LATIN SMALL LETTER O WITH TILDE AND MACRON]
                    case 0x22F: // ??	[LATIN SMALL LETTER O WITH DOT ABOVE]
                    case 0x231: // ??	[LATIN SMALL LETTER O WITH DOT ABOVE AND MACRON]
                    case 0x254: // ??	[LATIN SMALL LETTER OPEN O]
                    case 0x275: // ??	[LATIN SMALL LETTER BARRED O]
                    case 0x1D16: // ???	[LATIN SMALL LETTER TOP HALF O]
                    case 0x1D17: // ???	[LATIN SMALL LETTER BOTTOM HALF O]
                    case 0x1D97: // ???	[LATIN SMALL LETTER OPEN O WITH RETROFLEX HOOK]
                    case 0x1E4D: // ???	[LATIN SMALL LETTER O WITH TILDE AND ACUTE]
                    case 0x1E4F: // ???	[LATIN SMALL LETTER O WITH TILDE AND DIAERESIS]
                    case 0x1E51: // ???	[LATIN SMALL LETTER O WITH MACRON AND GRAVE]
                    case 0x1E53: // ???	[LATIN SMALL LETTER O WITH MACRON AND ACUTE]
                    case 0x1ECD: // ???	[LATIN SMALL LETTER O WITH DOT BELOW]
                    case 0x1ECF: // ???	[LATIN SMALL LETTER O WITH HOOK ABOVE]
                    case 0x1ED1: // ???	[LATIN SMALL LETTER O WITH CIRCUMFLEX AND ACUTE]
                    case 0x1ED3: // ???	[LATIN SMALL LETTER O WITH CIRCUMFLEX AND GRAVE]
                    case 0x1ED5: // ???	[LATIN SMALL LETTER O WITH CIRCUMFLEX AND HOOK ABOVE]
                    case 0x1ED7: // ???	[LATIN SMALL LETTER O WITH CIRCUMFLEX AND TILDE]
                    case 0x1ED9: // ???	[LATIN SMALL LETTER O WITH CIRCUMFLEX AND DOT BELOW]
                    case 0x1EDB: // ???	[LATIN SMALL LETTER O WITH HORN AND ACUTE]
                    case 0x1EDD: // ???	[LATIN SMALL LETTER O WITH HORN AND GRAVE]
                    case 0x1EDF: // ???	[LATIN SMALL LETTER O WITH HORN AND HOOK ABOVE]
                    case 0x1EE1: // ???	[LATIN SMALL LETTER O WITH HORN AND TILDE]
                    case 0x1EE3: // ???	[LATIN SMALL LETTER O WITH HORN AND DOT BELOW]
                    case 0x2092: // ???	[LATIN SUBSCRIPT SMALL LETTER O]
                    case 0x24DE: // ???	[CIRCLED LATIN SMALL LETTER O]
                    case 0x2C7A: // ???	[LATIN SMALL LETTER O WITH LOW RING INSIDE]
                    case 0xA74B: // ???	[LATIN SMALL LETTER O WITH LONG STROKE OVERLAY]
                    case 0xA74D: // ???	[LATIN SMALL LETTER O WITH LOOP]
                    case 0xFF4F: // ???	[FULLWIDTH LATIN SMALL LETTER O]
                        replacement = "o";
                        break;
                    case 0x1A5: // ??	[LATIN SMALL LETTER P WITH HOOK]
                    case 0x1D71: // ???	[LATIN SMALL LETTER P WITH MIDDLE TILDE]
                    case 0x1D7D: // ???	[LATIN SMALL LETTER P WITH STROKE]
                    case 0x1D88: // ???	[LATIN SMALL LETTER P WITH PALATAL HOOK]
                    case 0x1E55: // ???	[LATIN SMALL LETTER P WITH ACUTE]
                    case 0x1E57: // ???	[LATIN SMALL LETTER P WITH DOT ABOVE]
                    case 0x24DF: // ???	[CIRCLED LATIN SMALL LETTER P]
                    case 0xA751: // ???	[LATIN SMALL LETTER P WITH STROKE THROUGH DESCENDER]
                    case 0xA753: // ???	[LATIN SMALL LETTER P WITH FLOURISH]
                    case 0xA755: // ???	[LATIN SMALL LETTER P WITH SQUIRREL TAIL]
                    case 0xA7FC: // ???	[LATIN EPIGRAPHIC LETTER REVERSED P]
                    case 0xFF50: // ???	[FULLWIDTH LATIN SMALL LETTER P]
                        replacement = "p";
                        break;
                    case 0x155: // ??	[LATIN SMALL LETTER R WITH ACUTE]
                    case 0x157: // ??	[LATIN SMALL LETTER R WITH CEDILLA]
                    case 0x159: // ??	[LATIN SMALL LETTER R WITH CARON]
                    case 0x211: // ??	[LATIN SMALL LETTER R WITH DOUBLE GRAVE]
                    case 0x213: // ??	[LATIN SMALL LETTER R WITH INVERTED BREVE]
                    case 0x24D: // ??	[LATIN SMALL LETTER R WITH STROKE]
                    case 0x27C: // ??	[LATIN SMALL LETTER R WITH LONG LEG]
                    case 0x27D: // ??	[LATIN SMALL LETTER R WITH TAIL]
                    case 0x27E: // ??	[LATIN SMALL LETTER R WITH FISHHOOK]
                    case 0x27F: // ??	[LATIN SMALL LETTER REVERSED R WITH FISHHOOK]
                    case 0x1D63: // ???	[LATIN SUBSCRIPT SMALL LETTER R]
                    case 0x1D72: // ???	[LATIN SMALL LETTER R WITH MIDDLE TILDE]
                    case 0x1D73: // ???	[LATIN SMALL LETTER R WITH FISHHOOK AND MIDDLE TILDE]
                    case 0x1D89: // ???	[LATIN SMALL LETTER R WITH PALATAL HOOK]
                    case 0x1E59: // ???	[LATIN SMALL LETTER R WITH DOT ABOVE]
                    case 0x1E5B: // ???	[LATIN SMALL LETTER R WITH DOT BELOW]
                    case 0x1E5D: // ???	[LATIN SMALL LETTER R WITH DOT BELOW AND MACRON]
                    case 0x1E5F: // ???	[LATIN SMALL LETTER R WITH LINE BELOW]
                    case 0x24E1: // ???	[CIRCLED LATIN SMALL LETTER R]
                    case 0xA75B: // ???	[LATIN SMALL LETTER R ROTUNDA]
                    case 0xA783: // ???	[LATIN SMALL LETTER INSULAR R]
                    case 0xFF52: // ???	[FULLWIDTH LATIN SMALL LETTER R]
                        replacement = "r";
                        break;
                    case 0x15B: // ??	[LATIN SMALL LETTER S WITH ACUTE]
                    case 0x15D: // ??	[LATIN SMALL LETTER S WITH CIRCUMFLEX]
                    case 0x15F: // ??	[LATIN SMALL LETTER S WITH CEDILLA]
                    case 0x160: // ??	[LATIN Upper LETTER S WITH CARON]
                    case 0x161: // ??	[LATIN SMALL LETTER S WITH CARON]
                    case 0x17F: // ??	http;//en.wikipedia.org/wiki/Long_S	[LATIN SMALL LETTER LONG S]
                    case 0x219: // ??	[LATIN SMALL LETTER S WITH COMMA BELOW]
                    case 0x23F: // ??	[LATIN SMALL LETTER S WITH SWASH TAIL]
                    case 0x282: // ??	[LATIN SMALL LETTER S WITH HOOK]
                    case 0x1D74: // ???	[LATIN SMALL LETTER S WITH MIDDLE TILDE]
                    case 0x1D8A: // ???	[LATIN SMALL LETTER S WITH PALATAL HOOK]
                    case 0x1E61: // ???	[LATIN SMALL LETTER S WITH DOT ABOVE]
                    case 0x1E63: // ???	[LATIN SMALL LETTER S WITH DOT BELOW]
                    case 0x1E65: // ???	[LATIN SMALL LETTER S WITH ACUTE AND DOT ABOVE]
                    case 0x1E67: // ???	[LATIN SMALL LETTER S WITH CARON AND DOT ABOVE]
                    case 0x1E69: // ???	[LATIN SMALL LETTER S WITH DOT BELOW AND DOT ABOVE]
                    case 0x1E9C: // ???	[LATIN SMALL LETTER LONG S WITH DIAGONAL STROKE]
                    case 0x1E9D: // ???	[LATIN SMALL LETTER LONG S WITH HIGH STROKE]
                    case 0x24E2: // ???	[CIRCLED LATIN SMALL LETTER S]
                    case 0xA784: // ???	[LATIN CAPITAL LETTER INSULAR S]
                    case 0xFF53: // ???	[FULLWIDTH LATIN SMALL LETTER S]
                        replacement = "s";
                        break;
                    case 0x163: // ??	[LATIN SMALL LETTER T WITH CEDILLA]
                    case 0x165: // ??	[LATIN SMALL LETTER T WITH CARON]
                    case 0x167: // ??	[LATIN SMALL LETTER T WITH STROKE]
                    case 0x1AB: // ??	[LATIN SMALL LETTER T WITH PALATAL HOOK]
                    case 0x1AD: // ??	[LATIN SMALL LETTER T WITH HOOK]
                    case 0x21B: // ??	[LATIN SMALL LETTER T WITH COMMA BELOW]
                    case 0x236: // ??	[LATIN SMALL LETTER T WITH CURL]
                    case 0x287: // ??	[LATIN SMALL LETTER TURNED T]
                    case 0x288: // ??	[LATIN SMALL LETTER T WITH RETROFLEX HOOK]
                    case 0x1D75: // ???	[LATIN SMALL LETTER T WITH MIDDLE TILDE]
                    case 0x1E6B: // ???	[LATIN SMALL LETTER T WITH DOT ABOVE]
                    case 0x1E6D: // ???	[LATIN SMALL LETTER T WITH DOT BELOW]
                    case 0x1E6F: // ???	[LATIN SMALL LETTER T WITH LINE BELOW]
                    case 0x1E71: // ???	[LATIN SMALL LETTER T WITH CIRCUMFLEX BELOW]
                    case 0x1E97: // ???	[LATIN SMALL LETTER T WITH DIAERESIS]
                    case 0x24E3: // ???	[CIRCLED LATIN SMALL LETTER T]
                    case 0x2C66: // ???	[LATIN SMALL LETTER T WITH DIAGONAL STROKE]
                    case 0xFF54: // ???	[FULLWIDTH LATIN SMALL LETTER T]
                        replacement = "t";
                        break;
                    case 0xF9: // ??	[LATIN SMALL LETTER U WITH GRAVE]
                    case 0xFA: // ??	[LATIN SMALL LETTER U WITH ACUTE]
                    case 0xFB: // ??	[LATIN SMALL LETTER U WITH CIRCUMFLEX]
                    case 0xFC: // ??	[LATIN SMALL LETTER U WITH DIAERESIS]
                    case 0x169: // ??	[LATIN SMALL LETTER U WITH TILDE]
                    case 0x16B: // ??	[LATIN SMALL LETTER U WITH MACRON]
                    case 0x16D: // ??	[LATIN SMALL LETTER U WITH BREVE]
                    case 0x16F: // ??	[LATIN SMALL LETTER U WITH RING ABOVE]
                    case 0x171: // ??	[LATIN SMALL LETTER U WITH DOUBLE ACUTE]
                    case 0x173: // ??	[LATIN SMALL LETTER U WITH OGONEK]
                    case 0x1B0: // ??	[LATIN SMALL LETTER U WITH HORN]
                    case 0x1D4: // ??	[LATIN SMALL LETTER U WITH CARON]
                    case 0x1D6: // ??	[LATIN SMALL LETTER U WITH DIAERESIS AND MACRON]
                    case 0x1D8: // ??	[LATIN SMALL LETTER U WITH DIAERESIS AND ACUTE]
                    case 0x1DA: // ??	[LATIN SMALL LETTER U WITH DIAERESIS AND CARON]
                    case 0x1DC: // ??	[LATIN SMALL LETTER U WITH DIAERESIS AND GRAVE]
                    case 0x215: // ??	[LATIN SMALL LETTER U WITH DOUBLE GRAVE]
                    case 0x217: // ??	[LATIN SMALL LETTER U WITH INVERTED BREVE]
                    case 0x289: // ??	[LATIN SMALL LETTER U BAR]
                    case 0x1D64: // ???	[LATIN SUBSCRIPT SMALL LETTER U]
                    case 0x1D99: // ???	[LATIN SMALL LETTER U WITH RETROFLEX HOOK]
                    case 0x1E73: // ???	[LATIN SMALL LETTER U WITH DIAERESIS BELOW]
                    case 0x1E75: // ???	[LATIN SMALL LETTER U WITH TILDE BELOW]
                    case 0x1E77: // ???	[LATIN SMALL LETTER U WITH CIRCUMFLEX BELOW]
                    case 0x1E79: // ???	[LATIN SMALL LETTER U WITH TILDE AND ACUTE]
                    case 0x1E7B: // ???	[LATIN SMALL LETTER U WITH MACRON AND DIAERESIS]
                    case 0x1EE5: // ???	[LATIN SMALL LETTER U WITH DOT BELOW]
                    case 0x1EE7: // ???	[LATIN SMALL LETTER U WITH HOOK ABOVE]
                    case 0x1EE9: // ???	[LATIN SMALL LETTER U WITH HORN AND ACUTE]
                    case 0x1EEB: // ???	[LATIN SMALL LETTER U WITH HORN AND GRAVE]
                    case 0x1EED: // ???	[LATIN SMALL LETTER U WITH HORN AND HOOK ABOVE]
                    case 0x1EEF: // ???	[LATIN SMALL LETTER U WITH HORN AND TILDE]
                    case 0x1EF1: // ???	[LATIN SMALL LETTER U WITH HORN AND DOT BELOW]
                    case 0x24E4: // ???	[CIRCLED LATIN SMALL LETTER U]
                    case 0xFF55: // ???	[FULLWIDTH LATIN SMALL LETTER U]
                        replacement = "u";
                        break;
                    case 0x28B: // ??	[LATIN SMALL LETTER V WITH HOOK]
                    case 0x28C: // ??	[LATIN SMALL LETTER TURNED V]
                    case 0x1D65: // ???	[LATIN SUBSCRIPT SMALL LETTER V]
                    case 0x1D8C: // ???	[LATIN SMALL LETTER V WITH PALATAL HOOK]
                    case 0x1E7D: // ???	[LATIN SMALL LETTER V WITH TILDE]
                    case 0x1E7F: // ???	[LATIN SMALL LETTER V WITH DOT BELOW]
                    case 0x24E5: // ???	[CIRCLED LATIN SMALL LETTER V]
                    case 0x2C71: // ???	[LATIN SMALL LETTER V WITH RIGHT HOOK]
                    case 0x2C74: // ???	[LATIN SMALL LETTER V WITH CURL]
                    case 0xA75F: // ???	[LATIN SMALL LETTER V WITH DIAGONAL STROKE]
                    case 0xFF56: // ???	[FULLWIDTH LATIN SMALL LETTER V]
                        replacement = "v";
                        break;
                    case 0x175: // ??	[LATIN SMALL LETTER W WITH CIRCUMFLEX]
                    case 0x1BF: // ??	http;//en.wikipedia.org/wiki/Wynn	[LATIN LETTER WYNN]
                    case 0x28D: // ??	[LATIN SMALL LETTER TURNED W]
                    case 0x1E81: // ???	[LATIN SMALL LETTER W WITH GRAVE]
                    case 0x1E83: // ???	[LATIN SMALL LETTER W WITH ACUTE]
                    case 0x1E85: // ???	[LATIN SMALL LETTER W WITH DIAERESIS]
                    case 0x1E87: // ???	[LATIN SMALL LETTER W WITH DOT ABOVE]
                    case 0x1E89: // ???	[LATIN SMALL LETTER W WITH DOT BELOW]
                    case 0x1E98: // ???	[LATIN SMALL LETTER W WITH RING ABOVE]
                    case 0x24E6: // ???	[CIRCLED LATIN SMALL LETTER W]
                    case 0x2C73: // ???	[LATIN SMALL LETTER W WITH HOOK]
                    case 0xFF57: // ???	[FULLWIDTH LATIN SMALL LETTER W]
                        replacement = "w";
                        break;
                    case 0x1D8D: // ???	[LATIN SMALL LETTER X WITH PALATAL HOOK]
                    case 0x1E8B: // ???	[LATIN SMALL LETTER X WITH DOT ABOVE]
                    case 0x1E8D: // ???	[LATIN SMALL LETTER X WITH DIAERESIS]
                    case 0x2093: // ???	[LATIN SUBSCRIPT SMALL LETTER X]
                    case 0x24E7: // ???	[CIRCLED LATIN SMALL LETTER X]
                    case 0xFF58: // ???	[FULLWIDTH LATIN SMALL LETTER X]
                        replacement = "x";
                        break;
                    case 0xFD: // ??	[LATIN SMALL LETTER Y WITH ACUTE]
                    case 0xFF: // ??	[LATIN SMALL LETTER Y WITH DIAERESIS]
                    case 0x177: // ??	[LATIN SMALL LETTER Y WITH CIRCUMFLEX]
                    case 0x1B4: // ??	[LATIN SMALL LETTER Y WITH HOOK]
                    case 0x233: // ??	[LATIN SMALL LETTER Y WITH MACRON]
                    case 0x24F: // ??	[LATIN SMALL LETTER Y WITH STROKE]
                    case 0x28E: // ??	[LATIN SMALL LETTER TURNED Y]
                    case 0x1E8F: // ???	[LATIN SMALL LETTER Y WITH DOT ABOVE]
                    case 0x1E99: // ???	[LATIN SMALL LETTER Y WITH RING ABOVE]
                    case 0x1EF3: // ???	[LATIN SMALL LETTER Y WITH GRAVE]
                    case 0x1EF5: // ???	[LATIN SMALL LETTER Y WITH DOT BELOW]
                    case 0x1EF7: // ???	[LATIN SMALL LETTER Y WITH HOOK ABOVE]
                    case 0x1EF9: // ???	[LATIN SMALL LETTER Y WITH TILDE]
                    case 0x1EFF: // ???	[LATIN SMALL LETTER Y WITH LOOP]
                    case 0x24E8: // ???	[CIRCLED LATIN SMALL LETTER Y]
                    case 0xFF59: // ???	[FULLWIDTH LATIN SMALL LETTER Y]
                        replacement = "y";
                        break;
                    case 0x17A: // ??	[LATIN SMALL LETTER Z WITH ACUTE]
                    case 0x17C: // ??	[LATIN SMALL LETTER Z WITH DOT ABOVE]
                    case 0x17E: // ??	[LATIN SMALL LETTER Z WITH CARON]
                    case 0x1B6: // ??	[LATIN SMALL LETTER Z WITH STROKE]
                    case 0x21D: // ??	http;//en.wikipedia.org/wiki/Yogh	[LATIN SMALL LETTER YOGH]
                    case 0x225: // ??	[LATIN SMALL LETTER Z WITH HOOK]
                    case 0x240: // ??	[LATIN SMALL LETTER Z WITH SWASH TAIL]
                    case 0x290: // ??	[LATIN SMALL LETTER Z WITH RETROFLEX HOOK]
                    case 0x291: // ??	[LATIN SMALL LETTER Z WITH CURL]
                    case 0x1D76: // ???	[LATIN SMALL LETTER Z WITH MIDDLE TILDE]
                    case 0x1D8E: // ???	[LATIN SMALL LETTER Z WITH PALATAL HOOK]
                    case 0x1E91: // ???	[LATIN SMALL LETTER Z WITH CIRCUMFLEX]
                    case 0x1E93: // ???	[LATIN SMALL LETTER Z WITH DOT BELOW]
                    case 0x1E95: // ???	[LATIN SMALL LETTER Z WITH LINE BELOW]
                    case 0x24E9: // ???	[CIRCLED LATIN SMALL LETTER Z]
                    case 0x2C6C: // ???	[LATIN SMALL LETTER Z WITH DESCENDER]
                    case 0xA763: // ???	[LATIN SMALL LETTER VISIGOTHIC Z]
                    case 0xFF5A: // ???	[FULLWIDTH LATIN SMALL LETTER Z]
                        replacement = "z";
                        break;
                    default:
                        // we assume character is not a letter so we pass it on
                        replacement = string.charAt(i);
                        break;
                }
                // add it to string
                outStr += upper ? replacement.toUpperCase() : replacement;
            }
        }
    }
    return outStr;
}




