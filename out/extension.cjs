var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/adhan/lib/cjs/Madhab.js
var require_Madhab = __commonJS({
  "node_modules/adhan/lib/cjs/Madhab.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.Madhab = void 0;
    exports2.shadowLength = shadowLength;
    var Madhab2 = {
      Shafi: "shafi",
      Hanafi: "hanafi"
    };
    exports2.Madhab = Madhab2;
    function shadowLength(madhab) {
      switch (madhab) {
        case Madhab2.Shafi:
          return 1;
        case Madhab2.Hanafi:
          return 2;
        default:
          throw "Invalid Madhab";
      }
    }
  }
});

// node_modules/adhan/lib/cjs/HighLatitudeRule.js
var require_HighLatitudeRule = __commonJS({
  "node_modules/adhan/lib/cjs/HighLatitudeRule.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = void 0;
    var HighLatitudeRule2 = {
      MiddleOfTheNight: "middleofthenight",
      SeventhOfTheNight: "seventhofthenight",
      TwilightAngle: "twilightangle",
      recommended: function recommended(coordinates) {
        if (coordinates.latitude > 48) {
          return HighLatitudeRule2.SeventhOfTheNight;
        } else {
          return HighLatitudeRule2.MiddleOfTheNight;
        }
      }
    };
    var _default = HighLatitudeRule2;
    exports2["default"] = _default;
  }
});

// node_modules/adhan/lib/cjs/Coordinates.js
var require_Coordinates = __commonJS({
  "node_modules/adhan/lib/cjs/Coordinates.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = void 0;
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", { writable: false });
      return Constructor;
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var Coordinates2 = /* @__PURE__ */ _createClass(function Coordinates3(latitude, longitude) {
      _classCallCheck(this, Coordinates3);
      this.latitude = latitude;
      this.longitude = longitude;
    });
    exports2["default"] = Coordinates2;
  }
});

// node_modules/adhan/lib/cjs/Rounding.js
var require_Rounding = __commonJS({
  "node_modules/adhan/lib/cjs/Rounding.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.Rounding = void 0;
    var Rounding = {
      Nearest: "nearest",
      Up: "up",
      None: "none"
    };
    exports2.Rounding = Rounding;
  }
});

// node_modules/adhan/lib/cjs/DateUtils.js
var require_DateUtils = __commonJS({
  "node_modules/adhan/lib/cjs/DateUtils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.dateByAddingDays = dateByAddingDays;
    exports2.dateByAddingMinutes = dateByAddingMinutes;
    exports2.dateByAddingSeconds = dateByAddingSeconds;
    exports2.dayOfYear = dayOfYear;
    exports2.isValidDate = isValidDate;
    exports2.roundedMinute = roundedMinute;
    var _Astronomical = _interopRequireDefault(require_Astronomical());
    var _Rounding = require_Rounding();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    function dateByAddingDays(date, days) {
      var year = date.getFullYear();
      var month = date.getMonth();
      var day = date.getDate() + days;
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var seconds = date.getSeconds();
      return new Date(year, month, day, hours, minutes, seconds);
    }
    function dateByAddingMinutes(date, minutes) {
      return dateByAddingSeconds(date, minutes * 60);
    }
    function dateByAddingSeconds(date, seconds) {
      return new Date(date.getTime() + seconds * 1e3);
    }
    function roundedMinute(date) {
      var rounding = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : _Rounding.Rounding.Nearest;
      var seconds = date.getUTCSeconds();
      var offset = seconds >= 30 ? 60 - seconds : -1 * seconds;
      if (rounding === _Rounding.Rounding.Up) {
        offset = 60 - seconds;
      } else if (rounding === _Rounding.Rounding.None) {
        offset = 0;
      }
      return dateByAddingSeconds(date, offset);
    }
    function dayOfYear(date) {
      var returnedDayOfYear = 0;
      var feb = _Astronomical["default"].isLeapYear(date.getFullYear()) ? 29 : 28;
      var months = [31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      for (var i = 0; i < date.getMonth(); i++) {
        returnedDayOfYear += months[i];
      }
      returnedDayOfYear += date.getDate();
      return returnedDayOfYear;
    }
    function isValidDate(date) {
      return date instanceof Date && !isNaN(date.valueOf());
    }
  }
});

// node_modules/adhan/lib/cjs/MathUtils.js
var require_MathUtils = __commonJS({
  "node_modules/adhan/lib/cjs/MathUtils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.degreesToRadians = degreesToRadians;
    exports2.normalizeToScale = normalizeToScale;
    exports2.quadrantShiftAngle = quadrantShiftAngle;
    exports2.radiansToDegrees = radiansToDegrees;
    exports2.unwindAngle = unwindAngle;
    function degreesToRadians(degrees) {
      return degrees * Math.PI / 180;
    }
    function radiansToDegrees(radians) {
      return radians * 180 / Math.PI;
    }
    function normalizeToScale(num, max) {
      return num - max * Math.floor(num / max);
    }
    function unwindAngle(angle) {
      return normalizeToScale(angle, 360);
    }
    function quadrantShiftAngle(angle) {
      if (angle >= -180 && angle <= 180) {
        return angle;
      }
      return angle - 360 * Math.round(angle / 360);
    }
  }
});

// node_modules/adhan/lib/cjs/Shafaq.js
var require_Shafaq = __commonJS({
  "node_modules/adhan/lib/cjs/Shafaq.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.Shafaq = void 0;
    var Shafaq = {
      // General is a combination of Ahmer and Abyad.
      General: "general",
      // Ahmer means the twilight is the red glow in the sky. Used by the Shafi, Maliki, and Hanbali madhabs.
      Ahmer: "ahmer",
      // Abyad means the twilight is the white glow in the sky. Used by the Hanafi madhab.
      Abyad: "abyad"
    };
    exports2.Shafaq = Shafaq;
  }
});

// node_modules/adhan/lib/cjs/Astronomical.js
var require_Astronomical = __commonJS({
  "node_modules/adhan/lib/cjs/Astronomical.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = void 0;
    var _DateUtils = require_DateUtils();
    var _MathUtils = require_MathUtils();
    var _Shafaq = require_Shafaq();
    var Astronomical = {
      /* The geometric mean longitude of the sun in degrees. */
      meanSolarLongitude: function meanSolarLongitude(julianCentury) {
        var T = julianCentury;
        var term1 = 280.4664567;
        var term2 = 36000.76983 * T;
        var term3 = 3032e-7 * Math.pow(T, 2);
        var L0 = term1 + term2 + term3;
        return (0, _MathUtils.unwindAngle)(L0);
      },
      /* The geometric mean longitude of the moon in degrees. */
      meanLunarLongitude: function meanLunarLongitude(julianCentury) {
        var T = julianCentury;
        var term1 = 218.3165;
        var term2 = 481267.8813 * T;
        var Lp = term1 + term2;
        return (0, _MathUtils.unwindAngle)(Lp);
      },
      ascendingLunarNodeLongitude: function ascendingLunarNodeLongitude(julianCentury) {
        var T = julianCentury;
        var term1 = 125.04452;
        var term2 = 1934.136261 * T;
        var term3 = 20708e-7 * Math.pow(T, 2);
        var term4 = Math.pow(T, 3) / 45e4;
        var Omega = term1 - term2 + term3 + term4;
        return (0, _MathUtils.unwindAngle)(Omega);
      },
      /* The mean anomaly of the sun. */
      meanSolarAnomaly: function meanSolarAnomaly(julianCentury) {
        var T = julianCentury;
        var term1 = 357.52911;
        var term2 = 35999.05029 * T;
        var term3 = 1537e-7 * Math.pow(T, 2);
        var M = term1 + term2 - term3;
        return (0, _MathUtils.unwindAngle)(M);
      },
      /* The Sun's equation of the center in degrees. */
      solarEquationOfTheCenter: function solarEquationOfTheCenter(julianCentury, meanAnomaly) {
        var T = julianCentury;
        var Mrad = (0, _MathUtils.degreesToRadians)(meanAnomaly);
        var term1 = (1.914602 - 4817e-6 * T - 14e-6 * Math.pow(T, 2)) * Math.sin(Mrad);
        var term2 = (0.019993 - 101e-6 * T) * Math.sin(2 * Mrad);
        var term3 = 289e-6 * Math.sin(3 * Mrad);
        return term1 + term2 + term3;
      },
      /* The apparent longitude of the Sun, referred to the
            true equinox of the date. */
      apparentSolarLongitude: function apparentSolarLongitude(julianCentury, meanLongitude) {
        var T = julianCentury;
        var L0 = meanLongitude;
        var longitude = L0 + Astronomical.solarEquationOfTheCenter(T, Astronomical.meanSolarAnomaly(T));
        var Omega = 125.04 - 1934.136 * T;
        var Lambda = longitude - 569e-5 - 478e-5 * Math.sin((0, _MathUtils.degreesToRadians)(Omega));
        return (0, _MathUtils.unwindAngle)(Lambda);
      },
      /* The mean obliquity of the ecliptic, formula
            adopted by the International Astronomical Union.
            Represented in degrees. */
      meanObliquityOfTheEcliptic: function meanObliquityOfTheEcliptic(julianCentury) {
        var T = julianCentury;
        var term1 = 23.439291;
        var term2 = 0.013004167 * T;
        var term3 = 1639e-10 * Math.pow(T, 2);
        var term4 = 5036e-10 * Math.pow(T, 3);
        return term1 - term2 - term3 + term4;
      },
      /* The mean obliquity of the ecliptic, corrected for
            calculating the apparent position of the sun, in degrees. */
      apparentObliquityOfTheEcliptic: function apparentObliquityOfTheEcliptic(julianCentury, meanObliquityOfTheEcliptic) {
        var T = julianCentury;
        var Epsilon0 = meanObliquityOfTheEcliptic;
        var O = 125.04 - 1934.136 * T;
        return Epsilon0 + 256e-5 * Math.cos((0, _MathUtils.degreesToRadians)(O));
      },
      /* Mean sidereal time, the hour angle of the vernal equinox, in degrees. */
      meanSiderealTime: function meanSiderealTime(julianCentury) {
        var T = julianCentury;
        var JD = T * 36525 + 2451545;
        var term1 = 280.46061837;
        var term2 = 360.98564736629 * (JD - 2451545);
        var term3 = 387933e-9 * Math.pow(T, 2);
        var term4 = Math.pow(T, 3) / 3871e4;
        var Theta = term1 + term2 + term3 - term4;
        return (0, _MathUtils.unwindAngle)(Theta);
      },
      nutationInLongitude: function nutationInLongitude(julianCentury, solarLongitude, lunarLongitude, ascendingNode) {
        var L0 = solarLongitude;
        var Lp = lunarLongitude;
        var Omega = ascendingNode;
        var term1 = -17.2 / 3600 * Math.sin((0, _MathUtils.degreesToRadians)(Omega));
        var term2 = 1.32 / 3600 * Math.sin(2 * (0, _MathUtils.degreesToRadians)(L0));
        var term3 = 0.23 / 3600 * Math.sin(2 * (0, _MathUtils.degreesToRadians)(Lp));
        var term4 = 0.21 / 3600 * Math.sin(2 * (0, _MathUtils.degreesToRadians)(Omega));
        return term1 - term2 - term3 + term4;
      },
      nutationInObliquity: function nutationInObliquity(julianCentury, solarLongitude, lunarLongitude, ascendingNode) {
        var L0 = solarLongitude;
        var Lp = lunarLongitude;
        var Omega = ascendingNode;
        var term1 = 9.2 / 3600 * Math.cos((0, _MathUtils.degreesToRadians)(Omega));
        var term2 = 0.57 / 3600 * Math.cos(2 * (0, _MathUtils.degreesToRadians)(L0));
        var term3 = 0.1 / 3600 * Math.cos(2 * (0, _MathUtils.degreesToRadians)(Lp));
        var term4 = 0.09 / 3600 * Math.cos(2 * (0, _MathUtils.degreesToRadians)(Omega));
        return term1 + term2 + term3 - term4;
      },
      altitudeOfCelestialBody: function altitudeOfCelestialBody(observerLatitude, declination, localHourAngle) {
        var Phi = observerLatitude;
        var delta = declination;
        var H = localHourAngle;
        var term1 = Math.sin((0, _MathUtils.degreesToRadians)(Phi)) * Math.sin((0, _MathUtils.degreesToRadians)(delta));
        var term2 = Math.cos((0, _MathUtils.degreesToRadians)(Phi)) * Math.cos((0, _MathUtils.degreesToRadians)(delta)) * Math.cos((0, _MathUtils.degreesToRadians)(H));
        return (0, _MathUtils.radiansToDegrees)(Math.asin(term1 + term2));
      },
      approximateTransit: function approximateTransit(longitude, siderealTime, rightAscension) {
        var L = longitude;
        var Theta0 = siderealTime;
        var a2 = rightAscension;
        var Lw = L * -1;
        return (0, _MathUtils.normalizeToScale)((a2 + Lw - Theta0) / 360, 1);
      },
      /* The time at which the sun is at its highest point in the sky (in universal time) */
      correctedTransit: function correctedTransit(approximateTransit, longitude, siderealTime, rightAscension, previousRightAscension, nextRightAscension) {
        var m0 = approximateTransit;
        var L = longitude;
        var Theta0 = siderealTime;
        var a2 = rightAscension;
        var a1 = previousRightAscension;
        var a3 = nextRightAscension;
        var Lw = L * -1;
        var Theta = (0, _MathUtils.unwindAngle)(Theta0 + 360.985647 * m0);
        var a = (0, _MathUtils.unwindAngle)(Astronomical.interpolateAngles(a2, a1, a3, m0));
        var H = (0, _MathUtils.quadrantShiftAngle)(Theta - Lw - a);
        var dm = H / -360;
        return (m0 + dm) * 24;
      },
      correctedHourAngle: function correctedHourAngle(approximateTransit, angle, coordinates, afterTransit, siderealTime, rightAscension, previousRightAscension, nextRightAscension, declination, previousDeclination, nextDeclination) {
        var m0 = approximateTransit;
        var h0 = angle;
        var Theta0 = siderealTime;
        var a2 = rightAscension;
        var a1 = previousRightAscension;
        var a3 = nextRightAscension;
        var d2 = declination;
        var d1 = previousDeclination;
        var d3 = nextDeclination;
        var Lw = coordinates.longitude * -1;
        var term1 = Math.sin((0, _MathUtils.degreesToRadians)(h0)) - Math.sin((0, _MathUtils.degreesToRadians)(coordinates.latitude)) * Math.sin((0, _MathUtils.degreesToRadians)(d2));
        var term2 = Math.cos((0, _MathUtils.degreesToRadians)(coordinates.latitude)) * Math.cos((0, _MathUtils.degreesToRadians)(d2));
        var H0 = (0, _MathUtils.radiansToDegrees)(Math.acos(term1 / term2));
        var m = afterTransit ? m0 + H0 / 360 : m0 - H0 / 360;
        var Theta = (0, _MathUtils.unwindAngle)(Theta0 + 360.985647 * m);
        var a = (0, _MathUtils.unwindAngle)(Astronomical.interpolateAngles(a2, a1, a3, m));
        var delta = Astronomical.interpolate(d2, d1, d3, m);
        var H = Theta - Lw - a;
        var h = Astronomical.altitudeOfCelestialBody(coordinates.latitude, delta, H);
        var term3 = h - h0;
        var term4 = 360 * Math.cos((0, _MathUtils.degreesToRadians)(delta)) * Math.cos((0, _MathUtils.degreesToRadians)(coordinates.latitude)) * Math.sin((0, _MathUtils.degreesToRadians)(H));
        var dm = term3 / term4;
        return (m + dm) * 24;
      },
      /* Interpolation of a value given equidistant
            previous and next values and a factor
            equal to the fraction of the interpolated
            point's time over the time between values. */
      interpolate: function interpolate(y2, y1, y3, n) {
        var a = y2 - y1;
        var b = y3 - y2;
        var c = b - a;
        return y2 + n / 2 * (a + b + n * c);
      },
      /* Interpolation of three angles, accounting for
            angle unwinding. */
      interpolateAngles: function interpolateAngles(y2, y1, y3, n) {
        var a = (0, _MathUtils.unwindAngle)(y2 - y1);
        var b = (0, _MathUtils.unwindAngle)(y3 - y2);
        var c = b - a;
        return y2 + n / 2 * (a + b + n * c);
      },
      /* The Julian Day for the given Gregorian date components. */
      julianDay: function julianDay(year, month, day) {
        var hours = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
        var trunc = Math.trunc;
        var Y = trunc(month > 2 ? year : year - 1);
        var M = trunc(month > 2 ? month : month + 12);
        var D = day + hours / 24;
        var A = trunc(Y / 100);
        var B = trunc(2 - A + trunc(A / 4));
        var i0 = trunc(365.25 * (Y + 4716));
        var i1 = trunc(30.6001 * (M + 1));
        return i0 + i1 + D + B - 1524.5;
      },
      /* Julian century from the epoch. */
      julianCentury: function julianCentury(julianDay) {
        return (julianDay - 2451545) / 36525;
      },
      /* Whether or not a year is a leap year (has 366 days). */
      isLeapYear: function isLeapYear(year) {
        if (year % 4 !== 0) {
          return false;
        }
        if (year % 100 === 0 && year % 400 !== 0) {
          return false;
        }
        return true;
      },
      seasonAdjustedMorningTwilight: function seasonAdjustedMorningTwilight(latitude, dayOfYear, year, sunrise) {
        var a = 75 + 28.65 / 55 * Math.abs(latitude);
        var b = 75 + 19.44 / 55 * Math.abs(latitude);
        var c = 75 + 32.74 / 55 * Math.abs(latitude);
        var d = 75 + 48.1 / 55 * Math.abs(latitude);
        var adjustment = (function() {
          var dyy = Astronomical.daysSinceSolstice(dayOfYear, year, latitude);
          if (dyy < 91) {
            return a + (b - a) / 91 * dyy;
          } else if (dyy < 137) {
            return b + (c - b) / 46 * (dyy - 91);
          } else if (dyy < 183) {
            return c + (d - c) / 46 * (dyy - 137);
          } else if (dyy < 229) {
            return d + (c - d) / 46 * (dyy - 183);
          } else if (dyy < 275) {
            return c + (b - c) / 46 * (dyy - 229);
          } else {
            return b + (a - b) / 91 * (dyy - 275);
          }
        })();
        return (0, _DateUtils.dateByAddingSeconds)(sunrise, Math.round(adjustment * -60));
      },
      seasonAdjustedEveningTwilight: function seasonAdjustedEveningTwilight(latitude, dayOfYear, year, sunset, shafaq) {
        var a, b, c, d;
        if (shafaq === _Shafaq.Shafaq.Ahmer) {
          a = 62 + 17.4 / 55 * Math.abs(latitude);
          b = 62 - 7.16 / 55 * Math.abs(latitude);
          c = 62 + 5.12 / 55 * Math.abs(latitude);
          d = 62 + 19.44 / 55 * Math.abs(latitude);
        } else if (shafaq === _Shafaq.Shafaq.Abyad) {
          a = 75 + 25.6 / 55 * Math.abs(latitude);
          b = 75 + 7.16 / 55 * Math.abs(latitude);
          c = 75 + 36.84 / 55 * Math.abs(latitude);
          d = 75 + 81.84 / 55 * Math.abs(latitude);
        } else {
          a = 75 + 25.6 / 55 * Math.abs(latitude);
          b = 75 + 2.05 / 55 * Math.abs(latitude);
          c = 75 - 9.21 / 55 * Math.abs(latitude);
          d = 75 + 6.14 / 55 * Math.abs(latitude);
        }
        var adjustment = (function() {
          var dyy = Astronomical.daysSinceSolstice(dayOfYear, year, latitude);
          if (dyy < 91) {
            return a + (b - a) / 91 * dyy;
          } else if (dyy < 137) {
            return b + (c - b) / 46 * (dyy - 91);
          } else if (dyy < 183) {
            return c + (d - c) / 46 * (dyy - 137);
          } else if (dyy < 229) {
            return d + (c - d) / 46 * (dyy - 183);
          } else if (dyy < 275) {
            return c + (b - c) / 46 * (dyy - 229);
          } else {
            return b + (a - b) / 91 * (dyy - 275);
          }
        })();
        return (0, _DateUtils.dateByAddingSeconds)(sunset, Math.round(adjustment * 60));
      },
      daysSinceSolstice: function daysSinceSolstice(dayOfYear, year, latitude) {
        var daysSinceSolstice2 = 0;
        var northernOffset = 10;
        var southernOffset = Astronomical.isLeapYear(year) ? 173 : 172;
        var daysInYear = Astronomical.isLeapYear(year) ? 366 : 365;
        if (latitude >= 0) {
          daysSinceSolstice2 = dayOfYear + northernOffset;
          if (daysSinceSolstice2 >= daysInYear) {
            daysSinceSolstice2 = daysSinceSolstice2 - daysInYear;
          }
        } else {
          daysSinceSolstice2 = dayOfYear - southernOffset;
          if (daysSinceSolstice2 < 0) {
            daysSinceSolstice2 = daysSinceSolstice2 + daysInYear;
          }
        }
        return daysSinceSolstice2;
      }
    };
    var _default = Astronomical;
    exports2["default"] = _default;
  }
});

// node_modules/adhan/lib/cjs/SolarCoordinates.js
var require_SolarCoordinates = __commonJS({
  "node_modules/adhan/lib/cjs/SolarCoordinates.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = void 0;
    var _Astronomical = _interopRequireDefault(require_Astronomical());
    var _MathUtils = require_MathUtils();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", { writable: false });
      return Constructor;
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var SolarCoordinates = /* @__PURE__ */ _createClass(function SolarCoordinates2(julianDay) {
      _classCallCheck(this, SolarCoordinates2);
      var T = _Astronomical["default"].julianCentury(julianDay);
      var L0 = _Astronomical["default"].meanSolarLongitude(T);
      var Lp = _Astronomical["default"].meanLunarLongitude(T);
      var Omega = _Astronomical["default"].ascendingLunarNodeLongitude(T);
      var Lambda = (0, _MathUtils.degreesToRadians)(_Astronomical["default"].apparentSolarLongitude(T, L0));
      var Theta0 = _Astronomical["default"].meanSiderealTime(T);
      var dPsi = _Astronomical["default"].nutationInLongitude(T, L0, Lp, Omega);
      var dEpsilon = _Astronomical["default"].nutationInObliquity(T, L0, Lp, Omega);
      var Epsilon0 = _Astronomical["default"].meanObliquityOfTheEcliptic(T);
      var EpsilonApparent = (0, _MathUtils.degreesToRadians)(_Astronomical["default"].apparentObliquityOfTheEcliptic(T, Epsilon0));
      this.declination = (0, _MathUtils.radiansToDegrees)(Math.asin(Math.sin(EpsilonApparent) * Math.sin(Lambda)));
      this.rightAscension = (0, _MathUtils.unwindAngle)((0, _MathUtils.radiansToDegrees)(Math.atan2(Math.cos(EpsilonApparent) * Math.sin(Lambda), Math.cos(Lambda))));
      this.apparentSiderealTime = Theta0 + dPsi * 3600 * Math.cos((0, _MathUtils.degreesToRadians)(Epsilon0 + dEpsilon)) / 3600;
    });
    exports2["default"] = SolarCoordinates;
  }
});

// node_modules/adhan/lib/cjs/SolarTime.js
var require_SolarTime = __commonJS({
  "node_modules/adhan/lib/cjs/SolarTime.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = void 0;
    var _Astronomical = _interopRequireDefault(require_Astronomical());
    var _MathUtils = require_MathUtils();
    var _SolarCoordinates = _interopRequireDefault(require_SolarCoordinates());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", { writable: false });
      return Constructor;
    }
    var SolarTime = /* @__PURE__ */ (function() {
      function SolarTime2(date, coordinates) {
        _classCallCheck(this, SolarTime2);
        var julianDay = _Astronomical["default"].julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate(), 0);
        this.observer = coordinates;
        this.solar = new _SolarCoordinates["default"](julianDay);
        this.prevSolar = new _SolarCoordinates["default"](julianDay - 1);
        this.nextSolar = new _SolarCoordinates["default"](julianDay + 1);
        var m0 = _Astronomical["default"].approximateTransit(coordinates.longitude, this.solar.apparentSiderealTime, this.solar.rightAscension);
        var solarAltitude = -50 / 60;
        this.approxTransit = m0;
        this.transit = _Astronomical["default"].correctedTransit(m0, coordinates.longitude, this.solar.apparentSiderealTime, this.solar.rightAscension, this.prevSolar.rightAscension, this.nextSolar.rightAscension);
        this.sunrise = _Astronomical["default"].correctedHourAngle(m0, solarAltitude, coordinates, false, this.solar.apparentSiderealTime, this.solar.rightAscension, this.prevSolar.rightAscension, this.nextSolar.rightAscension, this.solar.declination, this.prevSolar.declination, this.nextSolar.declination);
        this.sunset = _Astronomical["default"].correctedHourAngle(m0, solarAltitude, coordinates, true, this.solar.apparentSiderealTime, this.solar.rightAscension, this.prevSolar.rightAscension, this.nextSolar.rightAscension, this.solar.declination, this.prevSolar.declination, this.nextSolar.declination);
      }
      _createClass(SolarTime2, [{
        key: "hourAngle",
        value: function hourAngle(angle, afterTransit) {
          return _Astronomical["default"].correctedHourAngle(this.approxTransit, angle, this.observer, afterTransit, this.solar.apparentSiderealTime, this.solar.rightAscension, this.prevSolar.rightAscension, this.nextSolar.rightAscension, this.solar.declination, this.prevSolar.declination, this.nextSolar.declination);
        }
      }, {
        key: "afternoon",
        value: function afternoon(shadowLength) {
          var tangent = Math.abs(this.observer.latitude - this.solar.declination);
          var inverse = shadowLength + Math.tan((0, _MathUtils.degreesToRadians)(tangent));
          var angle = (0, _MathUtils.radiansToDegrees)(Math.atan(1 / inverse));
          return this.hourAngle(angle, true);
        }
      }]);
      return SolarTime2;
    })();
    exports2["default"] = SolarTime;
  }
});

// node_modules/adhan/lib/cjs/PolarCircleResolution.js
var require_PolarCircleResolution = __commonJS({
  "node_modules/adhan/lib/cjs/PolarCircleResolution.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.polarCircleResolvedValues = exports2.PolarCircleResolution = void 0;
    var _Coordinates = _interopRequireDefault(require_Coordinates());
    var _SolarTime = _interopRequireDefault(require_SolarTime());
    var _DateUtils = require_DateUtils();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);
      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        enumerableOnly && (symbols = symbols.filter(function(sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        })), keys.push.apply(keys, symbols);
      }
      return keys;
    }
    function _objectSpread(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = null != arguments[i] ? arguments[i] : {};
        i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
          _defineProperty(target, key, source[key]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
      return target;
    }
    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    var PolarCircleResolution = {
      AqrabBalad: "AqrabBalad",
      AqrabYaum: "AqrabYaum",
      Unresolved: "Unresolved"
    };
    exports2.PolarCircleResolution = PolarCircleResolution;
    var LATITUDE_VARIATION_STEP = 0.5;
    var UNSAFE_LATITUDE = 65;
    var isValidSolarTime = function isValidSolarTime2(solarTime) {
      return !isNaN(solarTime.sunrise) && !isNaN(solarTime.sunset);
    };
    var aqrabYaumResolver = function aqrabYaumResolver2(coordinates, date) {
      var daysAdded = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
      var direction = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 1;
      if (daysAdded > Math.ceil(365 / 2)) {
        return null;
      }
      var testDate = new Date(date.getTime());
      testDate.setDate(testDate.getDate() + direction * daysAdded);
      var tomorrow = (0, _DateUtils.dateByAddingDays)(testDate, 1);
      var solarTime = new _SolarTime["default"](testDate, coordinates);
      var tomorrowSolarTime = new _SolarTime["default"](tomorrow, coordinates);
      if (!isValidSolarTime(solarTime) || !isValidSolarTime(tomorrowSolarTime)) {
        return aqrabYaumResolver2(coordinates, date, daysAdded + (direction > 0 ? 0 : 1), -direction);
      }
      return {
        date,
        tomorrow,
        coordinates,
        solarTime,
        tomorrowSolarTime
      };
    };
    var aqrabBaladResolver = function aqrabBaladResolver2(coordinates, date, latitude) {
      var solarTime = new _SolarTime["default"](date, _objectSpread(_objectSpread({}, coordinates), {}, {
        latitude
      }));
      var tomorrow = (0, _DateUtils.dateByAddingDays)(date, 1);
      var tomorrowSolarTime = new _SolarTime["default"](tomorrow, _objectSpread(_objectSpread({}, coordinates), {}, {
        latitude
      }));
      if (!isValidSolarTime(solarTime) || !isValidSolarTime(tomorrowSolarTime)) {
        return Math.abs(latitude) >= UNSAFE_LATITUDE ? aqrabBaladResolver2(coordinates, date, latitude - Math.sign(latitude) * LATITUDE_VARIATION_STEP) : null;
      }
      return {
        date,
        tomorrow,
        coordinates: new _Coordinates["default"](latitude, coordinates.longitude),
        solarTime,
        tomorrowSolarTime
      };
    };
    var polarCircleResolvedValues = function polarCircleResolvedValues2(resolver, date, coordinates) {
      var defaultReturn = {
        date,
        tomorrow: (0, _DateUtils.dateByAddingDays)(date, 1),
        coordinates,
        solarTime: new _SolarTime["default"](date, coordinates),
        tomorrowSolarTime: new _SolarTime["default"]((0, _DateUtils.dateByAddingDays)(date, 1), coordinates)
      };
      switch (resolver) {
        case PolarCircleResolution.AqrabYaum: {
          return aqrabYaumResolver(coordinates, date) || defaultReturn;
        }
        case PolarCircleResolution.AqrabBalad: {
          var latitude = coordinates.latitude;
          return aqrabBaladResolver(coordinates, date, latitude - Math.sign(latitude) * LATITUDE_VARIATION_STEP) || defaultReturn;
        }
        default: {
          return defaultReturn;
        }
      }
    };
    exports2.polarCircleResolvedValues = polarCircleResolvedValues;
  }
});

// node_modules/adhan/lib/cjs/CalculationParameters.js
var require_CalculationParameters = __commonJS({
  "node_modules/adhan/lib/cjs/CalculationParameters.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = void 0;
    var _Madhab = require_Madhab();
    var _HighLatitudeRule = _interopRequireDefault(require_HighLatitudeRule());
    var _PolarCircleResolution = require_PolarCircleResolution();
    var _Rounding = require_Rounding();
    var _Shafaq = require_Shafaq();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", { writable: false });
      return Constructor;
    }
    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    var CalculationParameters = /* @__PURE__ */ (function() {
      function CalculationParameters2(method) {
        var fajrAngle = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
        var ishaAngle = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
        var ishaInterval = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
        var maghribAngle = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0;
        _classCallCheck(this, CalculationParameters2);
        _defineProperty(this, "madhab", _Madhab.Madhab.Shafi);
        _defineProperty(this, "highLatitudeRule", _HighLatitudeRule["default"].MiddleOfTheNight);
        _defineProperty(this, "adjustments", {
          fajr: 0,
          sunrise: 0,
          dhuhr: 0,
          asr: 0,
          maghrib: 0,
          isha: 0
        });
        _defineProperty(this, "methodAdjustments", {
          fajr: 0,
          sunrise: 0,
          dhuhr: 0,
          asr: 0,
          maghrib: 0,
          isha: 0
        });
        _defineProperty(this, "polarCircleResolution", _PolarCircleResolution.PolarCircleResolution.Unresolved);
        _defineProperty(this, "rounding", _Rounding.Rounding.Nearest);
        _defineProperty(this, "shafaq", _Shafaq.Shafaq.General);
        this.method = method;
        this.fajrAngle = fajrAngle;
        this.ishaAngle = ishaAngle;
        this.ishaInterval = ishaInterval;
        this.maghribAngle = maghribAngle;
        if (this.method === null) {
          this.method = "Other";
        }
      }
      _createClass(CalculationParameters2, [{
        key: "nightPortions",
        value: function nightPortions() {
          switch (this.highLatitudeRule) {
            case _HighLatitudeRule["default"].MiddleOfTheNight:
              return {
                fajr: 1 / 2,
                isha: 1 / 2
              };
            case _HighLatitudeRule["default"].SeventhOfTheNight:
              return {
                fajr: 1 / 7,
                isha: 1 / 7
              };
            case _HighLatitudeRule["default"].TwilightAngle:
              return {
                fajr: this.fajrAngle / 60,
                isha: this.ishaAngle / 60
              };
            default:
              throw "Invalid high latitude rule found when attempting to compute night portions: ".concat(this.highLatitudeRule);
          }
        }
      }]);
      return CalculationParameters2;
    })();
    exports2["default"] = CalculationParameters;
  }
});

// node_modules/adhan/lib/cjs/CalculationMethod.js
var require_CalculationMethod = __commonJS({
  "node_modules/adhan/lib/cjs/CalculationMethod.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = void 0;
    var _CalculationParameters = _interopRequireDefault(require_CalculationParameters());
    var _Rounding = require_Rounding();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);
      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        enumerableOnly && (symbols = symbols.filter(function(sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        })), keys.push.apply(keys, symbols);
      }
      return keys;
    }
    function _objectSpread(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = null != arguments[i] ? arguments[i] : {};
        i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
          _defineProperty(target, key, source[key]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
      return target;
    }
    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    var CalculationMethod2 = {
      // Muslim World League
      MuslimWorldLeague: function MuslimWorldLeague() {
        var params = new _CalculationParameters["default"]("MuslimWorldLeague", 18, 17);
        params.methodAdjustments.dhuhr = 1;
        return params;
      },
      // Egyptian General Authority of Survey
      Egyptian: function Egyptian() {
        var params = new _CalculationParameters["default"]("Egyptian", 19.5, 17.5);
        params.methodAdjustments.dhuhr = 1;
        return params;
      },
      // University of Islamic Sciences, Karachi
      Karachi: function Karachi() {
        var params = new _CalculationParameters["default"]("Karachi", 18, 18);
        params.methodAdjustments.dhuhr = 1;
        return params;
      },
      // Umm al-Qura University, Makkah
      UmmAlQura: function UmmAlQura() {
        return new _CalculationParameters["default"]("UmmAlQura", 18.5, 0, 90);
      },
      // Dubai
      Dubai: function Dubai() {
        var params = new _CalculationParameters["default"]("Dubai", 18.2, 18.2);
        params.methodAdjustments = _objectSpread(_objectSpread({}, params.methodAdjustments), {}, {
          sunrise: -3,
          dhuhr: 3,
          asr: 3,
          maghrib: 3
        });
        return params;
      },
      // Moonsighting Committee
      MoonsightingCommittee: function MoonsightingCommittee() {
        var params = new _CalculationParameters["default"]("MoonsightingCommittee", 18, 18);
        params.methodAdjustments = _objectSpread(_objectSpread({}, params.methodAdjustments), {}, {
          dhuhr: 5,
          maghrib: 3
        });
        return params;
      },
      // ISNA
      NorthAmerica: function NorthAmerica() {
        var params = new _CalculationParameters["default"]("NorthAmerica", 15, 15);
        params.methodAdjustments.dhuhr = 1;
        return params;
      },
      // Kuwait
      Kuwait: function Kuwait() {
        return new _CalculationParameters["default"]("Kuwait", 18, 17.5);
      },
      // Qatar
      Qatar: function Qatar() {
        return new _CalculationParameters["default"]("Qatar", 18, 0, 90);
      },
      // Singapore
      Singapore: function Singapore() {
        var params = new _CalculationParameters["default"]("Singapore", 20, 18);
        params.methodAdjustments.dhuhr = 1;
        params.rounding = _Rounding.Rounding.Up;
        return params;
      },
      // Institute of Geophysics, University of Tehran
      Tehran: function Tehran() {
        var params = new _CalculationParameters["default"]("Tehran", 17.7, 14, 0, 4.5);
        return params;
      },
      // Dianet
      Turkey: function Turkey() {
        var params = new _CalculationParameters["default"]("Turkey", 18, 17);
        params.methodAdjustments = _objectSpread(_objectSpread({}, params.methodAdjustments), {}, {
          sunrise: -7,
          dhuhr: 5,
          asr: 4,
          maghrib: 7
        });
        return params;
      },
      // Other
      Other: function Other() {
        return new _CalculationParameters["default"]("Other", 0, 0);
      }
    };
    var _default = CalculationMethod2;
    exports2["default"] = _default;
  }
});

// node_modules/adhan/lib/cjs/Prayer.js
var require_Prayer = __commonJS({
  "node_modules/adhan/lib/cjs/Prayer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = void 0;
    var Prayer = {
      Fajr: "fajr",
      Sunrise: "sunrise",
      Dhuhr: "dhuhr",
      Asr: "asr",
      Maghrib: "maghrib",
      Isha: "isha",
      None: "none"
    };
    var _default = Prayer;
    exports2["default"] = _default;
  }
});

// node_modules/adhan/lib/cjs/TimeComponents.js
var require_TimeComponents = __commonJS({
  "node_modules/adhan/lib/cjs/TimeComponents.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = void 0;
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", { writable: false });
      return Constructor;
    }
    var TimeComponents = /* @__PURE__ */ (function() {
      function TimeComponents2(num) {
        _classCallCheck(this, TimeComponents2);
        this.hours = Math.floor(num);
        this.minutes = Math.floor((num - this.hours) * 60);
        this.seconds = Math.floor((num - (this.hours + this.minutes / 60)) * 60 * 60);
        return this;
      }
      _createClass(TimeComponents2, [{
        key: "utcDate",
        value: function utcDate(year, month, date) {
          return new Date(Date.UTC(year, month, date, this.hours, this.minutes, this.seconds));
        }
      }]);
      return TimeComponents2;
    })();
    exports2["default"] = TimeComponents;
  }
});

// node_modules/adhan/lib/cjs/PrayerTimes.js
var require_PrayerTimes = __commonJS({
  "node_modules/adhan/lib/cjs/PrayerTimes.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = void 0;
    var _SolarTime = _interopRequireDefault(require_SolarTime());
    var _TimeComponents4 = _interopRequireDefault(require_TimeComponents());
    var _Prayer = _interopRequireDefault(require_Prayer());
    var _Astronomical = _interopRequireDefault(require_Astronomical());
    var _DateUtils = require_DateUtils();
    var _Madhab = require_Madhab();
    var _PolarCircleResolution = require_PolarCircleResolution();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", { writable: false });
      return Constructor;
    }
    var PrayerTimes2 = /* @__PURE__ */ (function() {
      function PrayerTimes3(coordinates, date, calculationParameters) {
        _classCallCheck(this, PrayerTimes3);
        this.coordinates = coordinates;
        this.date = date;
        this.calculationParameters = calculationParameters;
        var solarTime = new _SolarTime["default"](date, coordinates);
        var fajrTime;
        var sunriseTime;
        var dhuhrTime;
        var asrTime;
        var sunsetTime;
        var maghribTime;
        var ishaTime;
        var nightFraction;
        dhuhrTime = new _TimeComponents4["default"](solarTime.transit).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
        sunriseTime = new _TimeComponents4["default"](solarTime.sunrise).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
        sunsetTime = new _TimeComponents4["default"](solarTime.sunset).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
        var tomorrow = (0, _DateUtils.dateByAddingDays)(date, 1);
        var tomorrowSolarTime = new _SolarTime["default"](tomorrow, coordinates);
        var polarCircleResolver = calculationParameters.polarCircleResolution;
        if ((!(0, _DateUtils.isValidDate)(sunriseTime) || !(0, _DateUtils.isValidDate)(sunsetTime) || isNaN(tomorrowSolarTime.sunrise)) && polarCircleResolver !== _PolarCircleResolution.PolarCircleResolution.Unresolved) {
          var _TimeComponents, _TimeComponents2, _TimeComponents3;
          var resolved = (0, _PolarCircleResolution.polarCircleResolvedValues)(polarCircleResolver, date, coordinates);
          solarTime = resolved.solarTime;
          tomorrowSolarTime = resolved.tomorrowSolarTime;
          var dateComponents = [date.getFullYear(), date.getMonth(), date.getDate()];
          dhuhrTime = (_TimeComponents = new _TimeComponents4["default"](solarTime.transit)).utcDate.apply(_TimeComponents, dateComponents);
          sunriseTime = (_TimeComponents2 = new _TimeComponents4["default"](solarTime.sunrise)).utcDate.apply(_TimeComponents2, dateComponents);
          sunsetTime = (_TimeComponents3 = new _TimeComponents4["default"](solarTime.sunset)).utcDate.apply(_TimeComponents3, dateComponents);
        }
        asrTime = new _TimeComponents4["default"](solarTime.afternoon((0, _Madhab.shadowLength)(calculationParameters.madhab))).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
        var tomorrowSunrise = new _TimeComponents4["default"](tomorrowSolarTime.sunrise).utcDate(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
        var night = (Number(tomorrowSunrise) - Number(sunsetTime)) / 1e3;
        fajrTime = new _TimeComponents4["default"](solarTime.hourAngle(-1 * calculationParameters.fajrAngle, false)).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
        if (calculationParameters.method === "MoonsightingCommittee" && coordinates.latitude >= 55) {
          nightFraction = night / 7;
          fajrTime = (0, _DateUtils.dateByAddingSeconds)(sunriseTime, -nightFraction);
        }
        var safeFajr = (function() {
          if (calculationParameters.method === "MoonsightingCommittee") {
            return _Astronomical["default"].seasonAdjustedMorningTwilight(coordinates.latitude, (0, _DateUtils.dayOfYear)(date), date.getFullYear(), sunriseTime);
          } else {
            var portion = calculationParameters.nightPortions().fajr;
            nightFraction = portion * night;
            return (0, _DateUtils.dateByAddingSeconds)(sunriseTime, -nightFraction);
          }
        })();
        if (isNaN(fajrTime.getTime()) || safeFajr > fajrTime) {
          fajrTime = safeFajr;
        }
        if (calculationParameters.ishaInterval > 0) {
          ishaTime = (0, _DateUtils.dateByAddingMinutes)(sunsetTime, calculationParameters.ishaInterval);
        } else {
          ishaTime = new _TimeComponents4["default"](solarTime.hourAngle(-1 * calculationParameters.ishaAngle, true)).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
          if (calculationParameters.method === "MoonsightingCommittee" && coordinates.latitude >= 55) {
            nightFraction = night / 7;
            ishaTime = (0, _DateUtils.dateByAddingSeconds)(sunsetTime, nightFraction);
          }
          var safeIsha = (function() {
            if (calculationParameters.method === "MoonsightingCommittee") {
              return _Astronomical["default"].seasonAdjustedEveningTwilight(coordinates.latitude, (0, _DateUtils.dayOfYear)(date), date.getFullYear(), sunsetTime, calculationParameters.shafaq);
            } else {
              var portion = calculationParameters.nightPortions().isha;
              nightFraction = portion * night;
              return (0, _DateUtils.dateByAddingSeconds)(sunsetTime, nightFraction);
            }
          })();
          if (isNaN(ishaTime.getTime()) || safeIsha < ishaTime) {
            ishaTime = safeIsha;
          }
        }
        maghribTime = sunsetTime;
        if (calculationParameters.maghribAngle) {
          var angleBasedMaghrib = new _TimeComponents4["default"](solarTime.hourAngle(-1 * calculationParameters.maghribAngle, true)).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
          if (sunsetTime < angleBasedMaghrib && ishaTime > angleBasedMaghrib) {
            maghribTime = angleBasedMaghrib;
          }
        }
        var fajrAdjustment = (calculationParameters.adjustments.fajr || 0) + (calculationParameters.methodAdjustments.fajr || 0);
        var sunriseAdjustment = (calculationParameters.adjustments.sunrise || 0) + (calculationParameters.methodAdjustments.sunrise || 0);
        var dhuhrAdjustment = (calculationParameters.adjustments.dhuhr || 0) + (calculationParameters.methodAdjustments.dhuhr || 0);
        var asrAdjustment = (calculationParameters.adjustments.asr || 0) + (calculationParameters.methodAdjustments.asr || 0);
        var maghribAdjustment = (calculationParameters.adjustments.maghrib || 0) + (calculationParameters.methodAdjustments.maghrib || 0);
        var ishaAdjustment = (calculationParameters.adjustments.isha || 0) + (calculationParameters.methodAdjustments.isha || 0);
        this.fajr = (0, _DateUtils.roundedMinute)((0, _DateUtils.dateByAddingMinutes)(fajrTime, fajrAdjustment), calculationParameters.rounding);
        this.sunrise = (0, _DateUtils.roundedMinute)((0, _DateUtils.dateByAddingMinutes)(sunriseTime, sunriseAdjustment), calculationParameters.rounding);
        this.dhuhr = (0, _DateUtils.roundedMinute)((0, _DateUtils.dateByAddingMinutes)(dhuhrTime, dhuhrAdjustment), calculationParameters.rounding);
        this.asr = (0, _DateUtils.roundedMinute)((0, _DateUtils.dateByAddingMinutes)(asrTime, asrAdjustment), calculationParameters.rounding);
        this.sunset = (0, _DateUtils.roundedMinute)(sunsetTime, calculationParameters.rounding);
        this.maghrib = (0, _DateUtils.roundedMinute)((0, _DateUtils.dateByAddingMinutes)(maghribTime, maghribAdjustment), calculationParameters.rounding);
        this.isha = (0, _DateUtils.roundedMinute)((0, _DateUtils.dateByAddingMinutes)(ishaTime, ishaAdjustment), calculationParameters.rounding);
      }
      _createClass(PrayerTimes3, [{
        key: "timeForPrayer",
        value: function timeForPrayer(prayer) {
          if (prayer === _Prayer["default"].Fajr) {
            return this.fajr;
          } else if (prayer === _Prayer["default"].Sunrise) {
            return this.sunrise;
          } else if (prayer === _Prayer["default"].Dhuhr) {
            return this.dhuhr;
          } else if (prayer === _Prayer["default"].Asr) {
            return this.asr;
          } else if (prayer === _Prayer["default"].Maghrib) {
            return this.maghrib;
          } else if (prayer === _Prayer["default"].Isha) {
            return this.isha;
          } else {
            return null;
          }
        }
      }, {
        key: "currentPrayer",
        value: function currentPrayer() {
          var date = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : /* @__PURE__ */ new Date();
          if (date >= this.isha) {
            return _Prayer["default"].Isha;
          } else if (date >= this.maghrib) {
            return _Prayer["default"].Maghrib;
          } else if (date >= this.asr) {
            return _Prayer["default"].Asr;
          } else if (date >= this.dhuhr) {
            return _Prayer["default"].Dhuhr;
          } else if (date >= this.sunrise) {
            return _Prayer["default"].Sunrise;
          } else if (date >= this.fajr) {
            return _Prayer["default"].Fajr;
          } else {
            return _Prayer["default"].None;
          }
        }
      }, {
        key: "nextPrayer",
        value: function nextPrayer() {
          var date = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : /* @__PURE__ */ new Date();
          if (date >= this.isha) {
            return _Prayer["default"].None;
          } else if (date >= this.maghrib) {
            return _Prayer["default"].Isha;
          } else if (date >= this.asr) {
            return _Prayer["default"].Maghrib;
          } else if (date >= this.dhuhr) {
            return _Prayer["default"].Asr;
          } else if (date >= this.sunrise) {
            return _Prayer["default"].Dhuhr;
          } else if (date >= this.fajr) {
            return _Prayer["default"].Sunrise;
          } else {
            return _Prayer["default"].Fajr;
          }
        }
      }]);
      return PrayerTimes3;
    })();
    exports2["default"] = PrayerTimes2;
  }
});

// node_modules/adhan/lib/cjs/Qibla.js
var require_Qibla = __commonJS({
  "node_modules/adhan/lib/cjs/Qibla.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = qibla;
    var _Coordinates = _interopRequireDefault(require_Coordinates());
    var _MathUtils = require_MathUtils();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    function qibla(coordinates) {
      var makkah = new _Coordinates["default"](21.4225241, 39.8261818);
      var term1 = Math.sin((0, _MathUtils.degreesToRadians)(makkah.longitude) - (0, _MathUtils.degreesToRadians)(coordinates.longitude));
      var term2 = Math.cos((0, _MathUtils.degreesToRadians)(coordinates.latitude)) * Math.tan((0, _MathUtils.degreesToRadians)(makkah.latitude));
      var term3 = Math.sin((0, _MathUtils.degreesToRadians)(coordinates.latitude)) * Math.cos((0, _MathUtils.degreesToRadians)(makkah.longitude) - (0, _MathUtils.degreesToRadians)(coordinates.longitude));
      var angle = Math.atan2(term1, term2 - term3);
      return (0, _MathUtils.unwindAngle)((0, _MathUtils.radiansToDegrees)(angle));
    }
  }
});

// node_modules/adhan/lib/cjs/SunnahTimes.js
var require_SunnahTimes = __commonJS({
  "node_modules/adhan/lib/cjs/SunnahTimes.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = void 0;
    var _DateUtils = require_DateUtils();
    var _PrayerTimes = _interopRequireDefault(require_PrayerTimes());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", { writable: false });
      return Constructor;
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var SunnahTimes = /* @__PURE__ */ _createClass(function SunnahTimes2(prayerTimes) {
      _classCallCheck(this, SunnahTimes2);
      var date = prayerTimes.date;
      var nextDay = (0, _DateUtils.dateByAddingDays)(date, 1);
      var nextDayPrayerTimes = new _PrayerTimes["default"](prayerTimes.coordinates, nextDay, prayerTimes.calculationParameters);
      var nightDuration = (nextDayPrayerTimes.fajr.getTime() - prayerTimes.maghrib.getTime()) / 1e3;
      this.middleOfTheNight = (0, _DateUtils.roundedMinute)((0, _DateUtils.dateByAddingSeconds)(prayerTimes.maghrib, nightDuration / 2));
      this.lastThirdOfTheNight = (0, _DateUtils.roundedMinute)((0, _DateUtils.dateByAddingSeconds)(prayerTimes.maghrib, nightDuration * (2 / 3)));
    });
    exports2["default"] = SunnahTimes;
  }
});

// node_modules/adhan/lib/cjs/Adhan.js
var require_Adhan = __commonJS({
  "node_modules/adhan/lib/cjs/Adhan.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    Object.defineProperty(exports2, "CalculationMethod", {
      enumerable: true,
      get: function get() {
        return _CalculationMethod["default"];
      }
    });
    Object.defineProperty(exports2, "CalculationParameters", {
      enumerable: true,
      get: function get() {
        return _CalculationParameters["default"];
      }
    });
    Object.defineProperty(exports2, "Coordinates", {
      enumerable: true,
      get: function get() {
        return _Coordinates["default"];
      }
    });
    Object.defineProperty(exports2, "HighLatitudeRule", {
      enumerable: true,
      get: function get() {
        return _HighLatitudeRule["default"];
      }
    });
    Object.defineProperty(exports2, "Madhab", {
      enumerable: true,
      get: function get() {
        return _Madhab.Madhab;
      }
    });
    Object.defineProperty(exports2, "PolarCircleResolution", {
      enumerable: true,
      get: function get() {
        return _PolarCircleResolution.PolarCircleResolution;
      }
    });
    Object.defineProperty(exports2, "Prayer", {
      enumerable: true,
      get: function get() {
        return _Prayer["default"];
      }
    });
    Object.defineProperty(exports2, "PrayerTimes", {
      enumerable: true,
      get: function get() {
        return _PrayerTimes["default"];
      }
    });
    Object.defineProperty(exports2, "Qibla", {
      enumerable: true,
      get: function get() {
        return _Qibla["default"];
      }
    });
    Object.defineProperty(exports2, "Rounding", {
      enumerable: true,
      get: function get() {
        return _Rounding.Rounding;
      }
    });
    Object.defineProperty(exports2, "Shafaq", {
      enumerable: true,
      get: function get() {
        return _Shafaq.Shafaq;
      }
    });
    Object.defineProperty(exports2, "SunnahTimes", {
      enumerable: true,
      get: function get() {
        return _SunnahTimes["default"];
      }
    });
    var _CalculationMethod = _interopRequireDefault(require_CalculationMethod());
    var _CalculationParameters = _interopRequireDefault(require_CalculationParameters());
    var _Coordinates = _interopRequireDefault(require_Coordinates());
    var _HighLatitudeRule = _interopRequireDefault(require_HighLatitudeRule());
    var _Madhab = require_Madhab();
    var _PolarCircleResolution = require_PolarCircleResolution();
    var _Prayer = _interopRequireDefault(require_Prayer());
    var _PrayerTimes = _interopRequireDefault(require_PrayerTimes());
    var _Qibla = _interopRequireDefault(require_Qibla());
    var _Rounding = require_Rounding();
    var _Shafaq = require_Shafaq();
    var _SunnahTimes = _interopRequireDefault(require_SunnahTimes());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
  }
});

// ext-src/extension.js
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"), 1);
var fs = __toESM(require("fs"), 1);

// src/utils/prayerTimeService.js
var import_adhan = __toESM(require_Adhan(), 1);
var getCalculationMethod = (methodId) => {
  const methods = {
    0: import_adhan.CalculationMethod.Tehran,
    // Jafari - closest equivalent
    1: import_adhan.CalculationMethod.Karachi,
    // University of Islamic Sciences, Karachi
    2: import_adhan.CalculationMethod.NorthAmerica,
    // Islamic Society of North America
    3: import_adhan.CalculationMethod.MuslimWorldLeague,
    // Muslim World League
    4: import_adhan.CalculationMethod.UmmAlQura,
    // Umm Al-Qura University, Makkah
    5: import_adhan.CalculationMethod.Egyptian,
    // Egyptian General Authority of Survey
    7: import_adhan.CalculationMethod.Tehran,
    // Institute of Geophysics, University of Tehran
    8: import_adhan.CalculationMethod.Gulf,
    // Gulf Region
    9: import_adhan.CalculationMethod.Kuwait,
    // Kuwait
    10: import_adhan.CalculationMethod.Qatar,
    // Qatar
    11: import_adhan.CalculationMethod.Singapore,
    // Majlis Ugama Islam Singapura
    12: import_adhan.CalculationMethod.Other,
    // Union Organization islamic de France (Approximate, generic Other often used)
    13: import_adhan.CalculationMethod.Turkey,
    // Diyanet İşleri Başkanlığı, Turkey
    14: import_adhan.CalculationMethod.Other,
    // Spiritual Administration of Muslims of Russia (No direct match, default Other)
    15: import_adhan.CalculationMethod.MoonsightingCommittee,
    // Moonsighting Committee Worldwide
    16: import_adhan.CalculationMethod.Dubai,
    // Dubai
    17: import_adhan.CalculationMethod.Other,
    // JAKIM (No direct match in basic adhan-js, use Other or similar)
    18: import_adhan.CalculationMethod.Other,
    // Tunisia
    19: import_adhan.CalculationMethod.Other,
    // Algeria
    20: import_adhan.CalculationMethod.Other,
    // KEMENAG Indonesia
    21: import_adhan.CalculationMethod.Other,
    // Morocco
    22: import_adhan.CalculationMethod.Other,
    // Comunidade Islamica de Lisboa
    23: import_adhan.CalculationMethod.Other
    // Jordan
  };
  return methods[methodId] ? methods[methodId]() : import_adhan.CalculationMethod.MuslimWorldLeague();
};
var getMadhab = (schoolId) => {
  return schoolId === 1 ? import_adhan.Madhab.Hanafi : import_adhan.Madhab.Shafi;
};
var getHighLatitudeRule = (ruleId) => {
  return ruleId === 1 ? import_adhan.HighLatitudeRule.MiddleOfTheNight : import_adhan.HighLatitudeRule.TwilightAngle;
};
var getPrayerTimes = (location, settings, date = /* @__PURE__ */ new Date()) => {
  if (!location || !location.lat || !location.lng) return null;
  const coordinates = new import_adhan.Coordinates(location.lat, location.lng);
  const params = getCalculationMethod(settings.method);
  params.madhab = getMadhab(settings.school);
  params.highLatitudeRule = getHighLatitudeRule(settings.latitudeAdjustmentMethod);
  const prayerTimes = new import_adhan.PrayerTimes(coordinates, date, params);
  let midnightTime;
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const prayerTimesTomorrow = new import_adhan.PrayerTimes(coordinates, tomorrow, params);
  const sunset = prayerTimes.sunset;
  if (settings.midnightMode === 1) {
    const nextFajr = prayerTimesTomorrow.fajr;
    const duration = nextFajr.getTime() - sunset.getTime();
    midnightTime = new Date(sunset.getTime() + duration / 2);
  } else {
    const nextSunrise = prayerTimesTomorrow.sunrise;
    const duration = nextSunrise.getTime() - sunset.getTime();
    midnightTime = new Date(sunset.getTime() + duration / 2);
  }
  const format = (d) => {
    if (!d) return "--:--";
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };
  const hijriFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-civil", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  let hijriData = { day: "", month: "", year: "", designation: { abbreviated: "AH" } };
  try {
    const parts = hijriFormatter.formatToParts(date);
    const day = parts.find((p) => p.type === "day")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const year = parts.find((p) => p.type === "year")?.value;
    hijriData = { day, month: { en: month }, year, designation: { abbreviated: "AH" } };
  } catch (e) {
    console.warn("Hijri date error", e);
  }
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    timings: {
      Fajr: format(prayerTimes.fajr),
      Sunrise: format(prayerTimes.sunrise),
      Dhuhr: format(prayerTimes.dhuhr),
      Asr: format(prayerTimes.asr),
      Sunset: format(prayerTimes.sunset),
      // API doesn't usually emphasize Sunset in main list but maghrib is same
      Maghrib: format(prayerTimes.maghrib),
      Isha: format(prayerTimes.isha),
      Midnight: format(midnightTime)
    },
    hijriDate: {
      day: hijriData.day,
      month: hijriData.month.en,
      year: hijriData.year,
      abbreviated: "AH"
      // approximated
    },
    timezone
  };
};

// src/utils/helpers.js
var CACHE_DURATION = 24 * 60 * 60 * 1e3;
var formatPrayerTime = (time, format = "12h") => {
  if (!time) return "";
  if (format === "24h") {
    return time;
  }
  const [hours, minutes] = time.split(":").map(Number);
  const ampm = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};

// ext-src/extension.js
var myStatusBarItem;
var prayerTimerInterval;
var myContext;
var lastAnnouncedPrayer = null;
var lastRamadanState = null;
function activate(context) {
  myContext = context;
  myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  context.subscriptions.push(myStatusBarItem);
  myStatusBarItem.text = `$(clock) PrayerTime: Pending`;
  myStatusBarItem.show();
  startBackgroundTimer();
  let disposable = vscode.commands.registerCommand("prayer-time.open", () => {
    const panel = vscode.window.createWebviewPanel(
      "prayerTime",
      "Prayer Time",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "dist")]
      }
    );
    const htmlPath = vscode.Uri.joinPath(context.extensionUri, "dist", "index.html");
    try {
      let html = fs.readFileSync(htmlPath.fsPath, "utf8");
      const distUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "dist"));
      html = html.replace(
        "<head>",
        `<head>
    <base href="${distUri}/">`
      );
      panel.webview.html = html;
      panel.webview.onDidReceiveMessage(
        (message) => {
          switch (message.command) {
            case "updateStatus":
              updateStatusBarItem(message.data);
              return;
            case "saveSettings":
              const { location, settings } = message.data;
              if (location && settings) {
                myContext.globalState.update("pt_location", location);
                myContext.globalState.update("pt_settings", settings);
                startBackgroundTimer();
              }
              return;
          }
        },
        void 0,
        context.subscriptions
      );
    } catch (error) {
      vscode.window.showErrorMessage("Failed to load Prayer Time webview. Have you built the extension?");
      console.error(error);
    }
  });
  context.subscriptions.push(disposable);
}
function startBackgroundTimer() {
  if (prayerTimerInterval) {
    clearInterval(prayerTimerInterval);
  }
  const defaultLocation = { name: "Dhaka", lat: 23.8103, lng: 90.4125 };
  const defaultSettings = {
    method: 3,
    // Muslim World League
    school: 1,
    // Hanafi
    midnightMode: 0,
    // Standard
    latitudeAdjustmentMethod: 3,
    // Angle Based
    timeFormat: "12hr",
    congregationOffsets: { Fajr: 30, Dhuhr: 15, Asr: 15, Maghrib: 10, Isha: 15 },
    congregationNotifyBefore: 5
  };
  const location = myContext.globalState.get("pt_location") || defaultLocation;
  const settings = myContext.globalState.get("pt_settings") || defaultSettings;
  cacheNextPrayerLoop(location, settings);
  prayerTimerInterval = setInterval(() => {
    cacheNextPrayerLoop(location, settings);
  }, 1e3);
}
function cacheNextPrayerLoop(location, settings) {
  const data = getPrayerTimes(location, settings, /* @__PURE__ */ new Date());
  if (!data) return;
  const timings = data.timings;
  const now = /* @__PURE__ */ new Date();
  const parseAdhanTime = (timeStr, offsetDays = 0) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    d.setDate(d.getDate() + offsetDays);
    return d;
  };
  const prayerOrder = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
  let nextPrayerName = "Fajr";
  let targetDate = parseAdhanTime(timings["Fajr"], 1);
  let currentPrayerName = "Isha";
  for (let i = 0; i < prayerOrder.length; i++) {
    const prayer = prayerOrder[i];
    const pTime = parseAdhanTime(timings[prayer]);
    if (pTime && now < pTime) {
      nextPrayerName = prayer;
      targetDate = pTime;
      currentPrayerName = i > 0 ? prayerOrder[i - 1] : "Isha";
      break;
    }
  }
  if (lastAnnouncedPrayer && lastAnnouncedPrayer !== currentPrayerName) {
    if (currentPrayerName === "Sunrise") {
      vscode.window.showInformationMessage("Fajr time has ended.");
    } else if (lastAnnouncedPrayer === "Sunrise") {
      vscode.window.showInformationMessage(`${currentPrayerName} time has started.`);
    } else {
      vscode.window.showInformationMessage(`${lastAnnouncedPrayer} time has ended. ${currentPrayerName} time has started.`);
    }
  }
  lastAnnouncedPrayer = currentPrayerName;
  if (currentPrayerName !== "Sunrise" && settings.congregationOffsets) {
    const prayerStartTime = parseAdhanTime(timings[currentPrayerName]);
    if (currentPrayerName === "Isha" && now < prayerStartTime) {
      prayerStartTime.setDate(prayerStartTime.getDate() - 1);
    }
    const offsetMins = settings.congregationOffsets[currentPrayerName] || 0;
    const notifyBeforeMins = settings.congregationNotifyBefore || 5;
    const congregationTime = new Date(prayerStartTime.getTime() + offsetMins * 6e4);
    const notifyTime = new Date(congregationTime.getTime() - notifyBeforeMins * 6e4);
    if (now >= notifyTime && now < congregationTime) {
      const congregationKey = `${currentPrayerName}_${congregationTime.getTime()}`;
      if (myContext.globalState.get("lastNotifiedCongregation") !== congregationKey) {
        vscode.window.showInformationMessage(`Congregation for ${currentPrayerName} will start in ${notifyBeforeMins} minutes.`);
        myContext.globalState.update("lastNotifiedCongregation", congregationKey);
      }
    }
  }
  let displayPrayer = currentPrayerName === "Sunrise" ? "Salatud Doha" : currentPrayerName;
  if (settings.ramadanMode) {
    const fajrTime = parseAdhanTime(timings["Fajr"]);
    const maghribTime = parseAdhanTime(timings["Maghrib"]);
    const isFasting = now >= fajrTime && now < maghribTime;
    if (lastRamadanState !== null && lastRamadanState !== isFasting) {
      if (isFasting) {
        vscode.window.showInformationMessage("Sehri time has ended! Fasting has begun.");
      } else {
        vscode.window.showInformationMessage("It's time for Iftar! Fasting has ended.");
      }
    }
    lastRamadanState = isFasting;
    if (isFasting) {
      displayPrayer = "Iftar";
      targetDate = maghribTime;
    } else {
      displayPrayer = "Sehri";
      if (now >= maghribTime) {
        targetDate = parseAdhanTime(timings["Fajr"], 1);
      } else {
        targetDate = fajrTime;
      }
    }
  }
  const msRemaining = targetDate.getTime() - now.getTime();
  if (msRemaining <= 0) {
    return;
  }
  const totalSecs = Math.floor(msRemaining / 1e3);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor(totalSecs % 3600 / 60);
  let formattedRemaining = "";
  if (hrs > 0) formattedRemaining += `${hrs}h `;
  formattedRemaining += `${mins}m`;
  let mdList = `**Today's Prayers (${location.name || "Local"})**

`;
  if (settings.ramadanMode) {
    mdList = `**Ramadan Mode (${location.name || "Local"})**

`;
    const sehriStr = formatPrayerTime(timings["Fajr"], settings.timeFormat);
    const iftarStr = formatPrayerTime(timings["Maghrib"], settings.timeFormat);
    mdList += `${displayPrayer === "Sehri" ? "\u25B6 **" : ""}Sehri: ${sehriStr}${displayPrayer === "Sehri" ? "**" : ""}

`;
    mdList += `${displayPrayer === "Iftar" ? "\u25B6 **" : ""}Iftar: ${iftarStr}${displayPrayer === "Iftar" ? "**" : ""}

`;
    mdList += `---

`;
  }
  prayerOrder.forEach((p) => {
    if (timings[p]) {
      const timeStr = formatPrayerTime(timings[p], settings.timeFormat);
      const isCurrent = !settings.ramadanMode && p === currentPrayerName;
      mdList += `${isCurrent ? "\u25B6 **" : ""}${p === "Sunrise" ? "Salatud Doha" : p}: ${timeStr}${isCurrent ? "**" : ""}

`;
    }
  });
  updateStatusBarItem({
    currentPrayer: displayPrayer,
    remainingTimeFormatted: formattedRemaining,
    prayerListMarkdown: mdList
  });
}
function updateStatusBarItem(data) {
  if (!data) return;
  const { currentPrayer, remainingTimeFormatted, prayerListMarkdown } = data;
  if (currentPrayer && remainingTimeFormatted) {
    myStatusBarItem.text = `$(watch) ${currentPrayer} in ${remainingTimeFormatted}`;
    const mdString = new vscode.MarkdownString(prayerListMarkdown);
    mdString.isTrusted = true;
    myStatusBarItem.tooltip = mdString;
    myStatusBarItem.show();
  } else {
    myStatusBarItem.text = `$(watch) PrayerTime: Calculating...`;
  }
}
function deactivate() {
  if (prayerTimerInterval) {
    clearInterval(prayerTimerInterval);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
