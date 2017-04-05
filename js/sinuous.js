const DEFAULT_COLOR = "#fff";
const HEAD_COLOR = "#f82220";
const TAIL_COLOR = "#c2003c";
const CHILD_COLOR = "#f96e37";
const POINT_COLOR = "#39e2c4";
const DEATH_COLOR = "#fff";
const G_COLOR = "#fcf13a";
const S_COLOR = "#c3fc3a";
const COLOR_1 = "#fc3a9e";
const T_COLOR = "#3a5afc";
const M_COLOR = "#fc5f3a";
const FONT_COLOR = "#000";
const S_EFFECT_COLOR_1 = "#fc783a";
const S_EFFECT_COLOR_2 = "#ec6319";
const G_EFFECT_COLOR_1 = "rgba(252, 219, 162, 0.6)";
const G_EFFECT_COLOR_2 = "rgba(252, 145, 58, 0)";

function suportsLocalStorage() {
    return "localStorage" in window && null !== window.localStorage
}

function Point(c, k) {
    this.position = {
        x: c,
        y: k
    }
}

Point.prototype.distanceTo = function(c) {
    var k = c.x - this.position.x,
        c = c.y - this.position.y;
    return Math.sqrt(k * k + c * c)
};

Point.prototype.clonePosition = function() {
    return {
        x: this.position.x,
        y: this.position.y
    }
};

function Region() {
    this.top = this.left = 999999;
    this.bottom = this.right = 0
}

Region.prototype.reset = function() {
    this.top = this.left = 999999;
    this.bottom = this.right = 0
};

Region.prototype.inflate = function(c, k) {
    this.left = Math.min(this.left, c);
    this.top = Math.min(this.top, k);
    this.right = Math.max(this.right, c);
    this.bottom = Math.max(this.bottom, k)
};

Region.prototype.expand = function(c, k) {
    this.left -= c;
    this.top -= k;
    this.right += 2 * c;
    this.bottom += 2 * k
};

Region.prototype.contains = function(c, k) {
    return c > this.left && c < this.right && k > this.top && k < this.bottom
};

Region.prototype.size = function() {
    return (this.right - this.left + (this.bottom - this.top)) / 2
};

Region.prototype.center = function() {
    return new Point(this.left + (this.right - this.left) / 2, this.top + (this.bottom - this.top) / 2)
};

Region.prototype.toRectangle = function() {
    return {
        x: this.left,
        y: this.top,
        width: this.right - this.left,
        height: this.bottom - this.top
    }
};

var SinuousWorld = new function() {
    var c = 0, k = 0, y = 0, v = 0;
    var xa = 1E3,
        ya = 600,
        M = 60,
        za = 0.25,
        ia = 3, //жизни
        Aa = 120,
        Y = "shield",
        N = "life",
        Z = "gravitywarp",
        ja = "timewarp",
        ka = "sizewarp",
        Da = [Y, Y, N, Z, Z, ja, ka],
        i = {
            x: 0,
            y: 0,
            width: xa,
            height: ya
        },
        q, b, x, sa, R, J, Ea, O, Fa = null,
        n = {
            messsage: "",
            progress: 0,
            target: 0
        },
        u = [],
        z = [],
        U = [],
        aa = [],
        a = null,
        E = window.innerWidth - i.width,
        F = window.innerHeight - i.height,
        s = false,
        ma = false,
        m = 0,
        Q = 0,
        ra = 0,
        I = 0,
        W = [],
        r = 1,
        G = [{ //параметры уровней
            factor: 1.2, //скорость
            duration: 300, //продолжительность по времени
            multiplier: 0.5 //на сколько увелисиваются очки
        }, {
            factor: 1.4,
            duration: 400,
            multiplier: 0.6
        }, {
            factor: 1.6,
            duration: 500,
            multiplier: 0.7
        }, {
            factor: 1.8,
            duration: 600,
            multiplier: 0.8
        }, {
            factor: 2,
            duration: 700,
            multiplier: 1
        }, {
            factor: 2.4,
            duration: 800,
            multiplier: 1.1
        }, {
            factor: 2.9,
            duration: 1E3,
            multiplier: 1.3
        }, {
            factor: 3.5,
            duration: 1300,
            multiplier: 1.7
        }, {
            factor: 4.8,
            duration: 2E3,
            multiplier: 2
        }],
        o = {
            unlockedLevels: 1,
            selectedLevel: 1,
            mute: false
        },
        H = {
            x: -1.3,
            y: 1
        };
    var B = {
            fpsMin: 1E3,
            fpsMax: 0
        },
        da = 1E3,
        ea = 0,
        ha = (new Date).getTime(),
        ga = 0,
        f = [];

    function ba() {
        suportsLocalStorage() && (localStorage.unlockedLevels = o.unlockedLevels, localStorage.selectedLevel = o.selectedLevel, localStorage.mute = o.mute)
    }

    function Ja() {
        ba();
        event.preventDefault()
    }

    function Ka() {
        suportsLocalStorage() && (localStorage.unlockedLevels = null, localStorage.selectedLevel = null, o.unlockedLevels = 1,
            r = o.selectedLevel = 1);
        P();
        event.preventDefault();
        alert("Game history was reset.")
    }

    function La() {
        s;
    }

    function Na(h) {
        false == s && (s = !0, u = [], z = [], v = y = k = c = I = m = 0, r = o.selectedLevel, a.trail = [], a.position.x = E, a.position.y = F, a.shield = 0, a.gravity = 0, a.flicker = 0, a.lives = ia-1, a.timewarped = false, a.timefactor = 0, a.sizewarped = false, a.sizefactor = 0, a.gravitywarped = false, a.gravityfactor = 0, J && (J.style.display = "none"), x.style.display =
            "none", w.style.display = "block", Q = (new Date).getTime());
        h.preventDefault();
    }

    function qa() {
        s = false;
        ra = (new Date).getTime() - Q;
        J && (J.style.display = "block");
        x.style.display = "block";
        m = Math.round(m);
        sa.innerHTML = "Game Over! (" + m + " points)";
        scoreText = "<span>Last results:</span>";
        scoreText += " Level <span>" + r + "</span>";
        scoreText += " Score <span>" + Math.round(m) + "</span>";
        scoreText += " Time <span>" + Math.round(100 * (((new Date).getTime() - Q) / 1E3)) / 100 + "s</span>";
        w.innerHTML = scoreText;
    }

    function P() {
        for (var a = R.getElementsByTagName("li"), b = 0, g = a.length; b < g; b++) {
            var c = b >= o.unlockedLevels ? "locked" : "unlocked";
            b + 1 == o.selectedLevel && (c = "selected");
            a[b].setAttribute("class", c);
        }
    }

    function Pa(a) {
        "unlocked" == a.target.getAttribute("class") && (o.selectedLevel = parseInt(a.target.getAttribute("data-level")), r = o.selectedLevel, P(), ba());
        a.preventDefault()
    }

    function Ua(a) {
        (E = a.clientX - 0.5 * (window.innerWidth - i.width) - 6, F = a.clientY - 0.5 * (window.innerHeight - i.height) - 6)
    }

    function Va() {}

    function Wa() {}

    function Xa(a) {
        1 == a.touches.length && (a.preventDefault(), E = a.touches[0].pageX - 0.5 * (window.innerWidth - i.width), F = a.touches[0].pageY - 0.5 * (window.innerHeight - i.height))
    }

    function Ya(a) {
        1 == a.touches.length && (a.preventDefault(), E = a.touches[0].pageX - 0.5 * (window.innerWidth - i.width) - 60, F = a.touches[0].pageY - 0.5 * (window.innerHeight - i.height) - 30)
    }

    function Za() {}

    function wa() {
        i.width = xa;
        i.height = ya;
        q.width = i.width;
        q.height = i.height;
        Math.max(0.5 * (window.innerHeight - i.height), 5);
        var a = 6;
        (x.style.left = a + "px", x.style.top = Math.round(i.height / 4) + "px", w.style.left = a + "px", w.style.top = a + "px");
    }

    function L(a, b, g) {
        g = g || 1;
        for (g = 10 * g + Math.random() * 15 * g; 0 <= --g;) {
            var c = new Point;
            c.position.x = a.x + Math.sin(g) * b;
            c.position.y =
                a.y + Math.cos(g) * b;
            c.velocity = {
                x: -4 + 8 * Math.random(),
                y: -4 + 8 * Math.random()
            };
            c.alpha = 1;
            U.push(c)
        }
    }

    function V(a, b, c, i) {
        W.push({
            x: a,
            y: b,
            width: c,
            height: i
        })
    }

    function C(a, b, c) {
        V(a - c, b - c, 2 * c, 2 * c)
    }

    function fa() {
        for (var h = W.length; h--;) {
            var t = W[h];
            b.clearRect(Math.floor(t.x), Math.floor(t.y), Math.ceil(t.width), Math.ceil(t.height))
        }
        W = [];
        h = (new Date).getTime();
        ga++;
        h > ha + 1E3 && (B = Math.min(Math.round(1E3 * ga / (h - ha)), M), da = Math.min(da, B), ea = Math.max(ea, B), ha = h, ga = 0);
        var g = G[r - 1],
            l = G[r],
            h = g.factor,
            t = g.multiplier;
        r < G.length &&
            s && (h += I / g.duration * (l.factor - g.factor));
        l = 0.01 + 0.99 * (Math.max(Math.min(B, M), 0) / M);
        (l = l * l * t) || (l = 0.5);
        var t = H.x * h * (1 - a.timefactor),
            g = H.y * h * (1 - a.timefactor),
            d, j, f;
        j = 1 == a.flicker % 4 || 2 == a.flicker % 4;
        if (s) {
            pp = a.clonePosition();
            a.position.x += (E - a.position.x) * za;
            a.position.y += (F - a.position.y) * za;
            m += 0.4 * h * l;
            m += 0.1 * a.distanceTo(pp) * l;
            c++;
            k += 0.4 * h * l;
            y += 0.1 * a.distanceTo(pp) * l;
            a.flicker = Math.max(a.flicker - 1, 0);
            a.shield = Math.max(a.shield - 1, 0);
            a.gravity = Math.max(a.gravity - 0.35, 0);
            a.timewarped ? (0.5999 < a.timefactor &&
                (a.timewarped = false), a.timefactor += 0.1 * (0.6 - a.timefactor)) : a.timefactor += 0.002 * (0 - a.timefactor);
            a.timefactor = Math.max(Math.min(a.timefactor, 1), 0);
            a.sizewarped ? (0.5999 < a.sizefactor && (a.sizewarped = false), a.sizefactor += 0.04 * (0.6 - a.sizefactor)) : a.sizefactor += 0.01 * (0 - a.sizefactor);
            a.sizefactor = Math.max(Math.min(a.sizefactor, 1), 0);
            a.gravitywarped ? (0.99995 < a.gravityfactor && (a.gravitywarped = false), a.gravityfactor += 0.04 * (1 - a.gravityfactor)) : (0.12 > a.gravityfactor && (a.gravityfactor = 0), a.gravityfactor += 0.014 * (0 - a.gravityfactor));
            a.gravityfactor = Math.max(Math.min(a.gravityfactor, 1), 0);
            if (0 < a.shield && (100 < a.shield || 0 != a.shield % 3)) d = a.size * (Math.min(a.shield, 100) / 50), b.beginPath(), b.fillStyle = S_EFFECT_COLOR_1, b.strokeStyle = S_EFFECT_COLOR_2, b.arc(a.position.x, a.position.y, d, 0, 2 * Math.PI, !0), b.fill(), b.stroke(), C(a.position.x, a.position.y, d + 2);
            0 < a.gravityfactor && (f = a.gravityfactor * Aa, d = b.createRadialGradient(a.position.x, a.position.y, 0, a.position.x, a.position.y, f), d.addColorStop(0.1, G_EFFECT_COLOR_1), d.addColorStop(0.8, G_EFFECT_COLOR_2),
                b.beginPath(), b.fillStyle = d, b.arc(a.position.x, a.position.y, f, 0, 2 * Math.PI, !0), b.fill(), C(a.position.x, a.position.y, f));
            for (; 60 > a.trail.length - 1;) a.trail.push(new Point(a.position.x, a.position.y));
            b.beginPath();
            b.strokeStyle = j ? "333333" : TAIL_COLOR;
            b.lineWidth = 2;
            var q = new Region;
            d = 0;
            for (f = a.trail.length; d < f; d++) p = a.trail[d], p2 = a.trail[d + 1], 0 == d ? b.moveTo(p.position.x, p.position.y) : p2 && b.quadraticCurveTo(p.position.x, p.position.y, p.position.x + (p2.position.x - p.position.x) / 2, p.position.y + (p2.position.y - p.position.y) /
                2), q.inflate(p.position.x, p.position.y), p.position.x += t, p.position.y += g;
            q.expand(10, 10);
            d = q.toRectangle();
            V(d.x, d.y, d.width, d.height);
            b.stroke();
            b.closePath();
            f = 0;
            for (d = a.trail.length - 1; 0 < d; d--) {
                p = a.trail[d];
                if (d == Math.round(51) || d == Math.round(45) || d == Math.round(39)) b.beginPath(), b.lineWidth = 0.5, b.fillStyle = j ? DEATH_COLOR : CHILD_COLOR , b.arc(p.position.x, p.position.y, 2.5, 0, 2 * Math.PI, !0), b.fill(), C(p.position.x, p.position.y, 8), f++;
                if (f == a.lives) break
            }
            60 < a.trail.length && a.trail.shift();
            b.beginPath();
            b.fillStyle =
                j ? DEATH_COLOR : HEAD_COLOR;
            b.arc(a.position.x, a.position.y, a.size / 2, 0, 2 * Math.PI, !0);
            b.fill();
            C(a.position.x, a.position.y, a.size + 6)
        }
        if (s && (0 > a.position.x || a.position.x > i.width || 0 > a.position.y || a.position.y > i.height)) L(a.position, 10), qa();
        for (d = 0; d < u.length; d++) {
            p = u[d];
            p.size = p.originalSize * (1 - a.sizefactor);
            p.offset.x *= 0.95;
            p.offset.y *= 0.95;
            j = p.distanceTo(a.position);
            if (s)
                if (0 < a.gravityfactor) q = Math.atan2(p.position.y - a.position.y, p.position.x - a.position.x), f = a.gravityfactor * Aa, j < f && (p.offset.x += 0.2 * (Math.cos(q) *
                    (f - j) - p.offset.x), p.offset.y += 0.2 * (Math.sin(q) * (f - j) - p.offset.y));
                else if (0 < a.shield && j < 0.5 * (4 * a.size + p.size)) {
                L(p.position, 10);
                u.splice(d, 1);
                d--;
                m += 20 * l;
                v += 20 * l;
                X(Math.ceil(20 * l), p.clonePosition(), p.force);
                continue
            } else j < 0.5 * (a.size + p.size) && 0 == a.flicker && (0 < a.lives ? (L(a.position, 4), a.lives--, a.flicker += 60, u.splice(d, 1), d--) : (L(a.position, 10), qa()));
            b.beginPath();
            b.fillStyle = POINT_COLOR;
            b.arc(p.position.x + p.offset.x, p.position.y + p.offset.y, p.size / 2, 0, 2 * Math.PI, !0);//форма поинта
            b.fill();
            C(p.position.x + p.offset.x, p.position.y + p.offset.y, p.size);
            p.position.x += t * p.force;//направление движения точек
            p.position.y += g * p.force;
            if (p.position.x < -p.size || p.position.y > i.height + p.size) u.splice(d, 1), d--, s && I++
        }
        for (d = 0; d < z.length; d++) {
            p = z[d];
            if (p.distanceTo(a.position) < 0.5 * (a.size + p.size) && s) {
                p.type == Y ? (a.shield = 300) : p.type == N ? a.lives < ia && (X("LIFE UP!", p.clonePosition(), p.force), a.lives = Math.min(a.lives + 1, ia)) : p.type == Z ? a.gravitywarped = !0 : p.type == ja ? a.timewarped = !0 : p.type == ka && (a.sizewarped = !0);
                p.type != N && (m += 50 * l, v += 50 * l, X(Math.ceil(50 * l), p.clonePosition(), p.force));
                for (j = 0; j < u.length; j++) e = u[j], 100 > e.distanceTo(p.position) && (L(e.position, 10), u.splice(j, 1), j--, m += 20 * l, v += 20 * l, X(Math.ceil(20 * l), e.clonePosition(), e.force));
                z.splice(d, 1);
                d--
            } else if (p.position.x < -p.size || p.position.y > i.height + p.size) z.splice(d, 1), d--;
            j = "";
            f = DEFAULT_COLOR;
            p.type === Y ? (j = "S", f = S_COLOR) : p.type === N ? (j = "1", f = COLOR_1) :
                p.type === Z ? (j = "G", f = G_COLOR) : p.type === ja ? (j = "T", f = T_COLOR) :
                p.type === ka && (j = "M", f = M_COLOR);
            b.beginPath();
            b.fillStyle = f;
            b.arc(p.position.x, p.position.y, p.size / 2, 0, 2 * Math.PI, !0);
            b.fill();
            b.save();
            b.font = "bold 12px Arial";
            b.fillStyle = FONT_COLOR;
            b.fillText(j, p.position.x - 0.5 * b.measureText(j).width, p.position.y + 4);
            b.restore();
            C(p.position.x, p.position.y, p.size);
            p.position.x += t * p.force;
            p.position.y += g * p.force;
        }
        u.length < 27 * h && u.push(Ba(new Ca));
        if (1 > z.length && 0.994 < Math.random() && false == a.isBoosted()) {
            for (h =
                new la; h.type == N && a.lives >= ia;) h.randomizeType();
            z.push(Ba(h))
        }
        1 == a.shield && s;
        for (d = 0; d < U.length; d++)
            p = U[d], p.velocity.x += 0.04 * (t - p.velocity.x), p.velocity.y += 0.04 * (g - p.velocity.y), p.position.x += p.velocity.x, p.position.y += p.velocity.y, p.alpha -= 0.02, b.fillStyle = /*цвет всплесков*/"rgba(255,255,255," + Math.max(p.alpha, 0) + ")", b.fillRect(p.position.x, p.position.y, 1, 1), C(p.position.x, p.position.y, 2), 0 >= p.alpha && U.splice(d, 1);
        for (d = 0; d < aa.length; d++)
        p = aa[d], p.position.x += t * p.force, p.position.y += g * p.force, p.position.y -= 1, h = b.measureText(p.text).width, l = p.position.x - 0.5 * h, b.save(), b.font = "10px Arial", b.fillStyle = "rgba( 255, 255, 255, " + p.alpha + " )"/*цвет очков*/, b.fillText(p.text, l, p.position.y), b.restore(), V(l - 5, p.position.y - 12, h + 8, 22), p.alpha *= 0.96, 0.05 > p.alpha && (aa.splice(d, 1), d--);
        n.message && "" !== n.message && (n.progress += 0.05 * (n.target - n.progress), 0.9999999 < n.progress ? n.target = 0 : 0 == n.target && 0.05 > n.progress && (n.message = ""), b.save(), b.font = "bold 22px Arial", p = {
            x: i.width - b.measureText(n.message).width - 15,
            y: i.height + 40 - 55 * n.progress
        }, b.translate(p.x, p.y), b.fillStyle = /*цвет уровня*/"rgba( 0, 0, 0, " + 0.4 * n.progress + " )", b.fillRect(-15, -30, 200, 100), b.fillStyle = "rgba( 255, 255, 255, " + n.progress + " )", b.fillText(n.message, 0, 0), V(p.x - 15, p.y - 30, 200, 100), b.restore());
        if (s) {
            if (h = I > G[r - 1].duration)
                r < G.length ? (r++, I = 0, o.unlockedLevels = Math.max(o.unlockedLevels, r), ba(), P(), h = !0) : h = false;
            h && (n.message = "LEVEL " + r + "!", n.progress = 0, n.target = 1);
            scoreText = "<span>Last results:</span>";
            scoreText += " Level <span>" + r + "</span>";
            scoreText += " Score <span>" + Math.round(m) + "</span>";
            scoreText += " Time <span>" + Math.round(100 * (((new Date).getTime() - Q) / 1E3)) / 100 + "s</span>";
            w.innerHTML = scoreText;
        }
        ma || requestAnimFrame(fa);
    }

    function X(a, b, c) {
        aa.push({
            text: a,
            position: {
                x: b.x,
                y: b.y
            },
            alpha: 1,
            force: c
        })
    }

    function Ba(a) {
        0.5 < Math.random() ? (a.position.x = Math.random() * i.width, a.position.y = -20) : (a.position.x = i.width + 20, a.position.y = 0.2 * -i.height + 1.2 * Math.random() * i.height);
        return a
    }

    function na() {
        this.position = {
            x: 0,
            y: 0
        };
        this.trail = [];
        this.size = 8;
        this.shield = 0;
        this.lives = ia-1;
        this.flicker = 0;
        this.gravitywarped = false;
        this.gravityfactor = 0;
        this.timewarped = false;
        this.timefactor = 0;
        this.sizewarped = false;
        this.sizefactor = 0
    }

    function Ca() {
        this.position = {
            x: 0,
            y: 0
        };
        this.offset = {
            x: 0,
            y: 0
        };
        this.originalSize = this.size = 10 + 4 * Math.random();
        this.force = 1 + 0.1 * Math.random()//скорость поинтов!!!
    }

    function la() {
        this.type = null;
        this.position = {
            x: 0,
            y: 0
        };
        this.size = 30 + 4 * Math.random();
        this.force = 0.8 + 1 * Math.random();//скорость плюшек!!!
        this.randomizeType()
    }

    this.initialize = function() {
        q = document.getElementById("world");
        x = document.getElementById("menu");
        w = document.getElementById("game-status");
        J = document.getElementById("promotion");
        sa = document.getElementById("title");
        R = document.getElementById("level-selector");
        Ea = document.getElementById("start-button");
        Fa = document.getElementById("reset-button");
        if (q && q.getContext) {
            b = q.getContext("2d");
            document.addEventListener("mousemove", Ua, false);
            document.addEventListener("mousedown", Va, false);
            document.addEventListener("mouseup", Wa, false);
            q.addEventListener("touchstart", Xa, false);
            document.addEventListener("touchmove", Ya, false);
            document.addEventListener("touchend", Za, false);
            Ea.addEventListener("click", Na, false);
            Fa.addEventListener("click", Ka, false);
            window.addEventListener("resize", wa, false);
            if (suportsLocalStorage()) {
                var c = parseInt(localStorage.unlockedLevels),
                    f = parseInt(localStorage.selectedLevel),
                    g = localStorage.mute;
                c && (o.unlockedLevels = c);
                f && (o.selectedLevel = f);
                g && (o.mute = "true" == g);
            }
            g = "";
            c = 1;
            for (f = G.length; c <= f; c++) g += '<li data-level="' + c + '">' + c + "</li>";
            R.getElementsByTagName("ul")[0].innerHTML = g;
            g = R.getElementsByTagName("li");
            c = 0;
            for (f = g.length; c < f; c++) g[c].addEventListener("click", Pa, false);
            P();
            a = new na;
            wa();
            (w.style.width = i.width + "px", q.style.border = "none", H.x *= 2, H.y *= 2);
            fa();
            q.style.display = "block";
            x.style.display = "block";
        }
    };
    this.pause = function() {
        ma = !0;
    };
    this.resume = function() {
        ma = false;
        suportsLocalStorage() && "false" == localStorage.mute;
        fa();
    };
    na.prototype = new Point;
    na.prototype.isBoosted = function() {
        return 0 != this.shield || 0 != this.gravityfactor;
    };
    Ca.prototype = new Point;
    la.prototype = new Point;
    la.prototype.randomizeType = function() {
        this.type = Da[Math.round(Math.random() * (Da.length - 1))];
    }
};
window.requestAnimFrame = function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(c) {
        window.setTimeout(c, 1E3 / 60);
    }
}();

SinuousWorld.initialize();
