/** Inheritance and Error classes **/

class AnalemmaManager {
	constructor() {
		this.config = {
			autoCanvas: true,
			shave: true,
		}
		this.reference = {};
		this.animations = [];
		this.frameCount = 0;
		this.reference = {};
	}

	setContext(ctx) {
		AnalemmaHeirarchy.ctx = ctx;
		if (!ctx && this.config.autoCanvas) {
			let h = document.body;
			let c = document.createElement('canvas');
			h.appendChild(c);
			c.id = 'c';
			AnalemmaHeirarchy.ctx = c.getContext('2d');
			AnalemmaHeirarchy.ctx.canvas.width = window.innerWidth;
			AnalemmaHeirarchy.ctx.canvas.height = window.innerHeight;
			document.body.style.margin = '0px';
			document.body.style.overflow = 'hidden';
			window.ctx = AnalemmaHeirarchy.ctx;
		}
	}
	initialize(location = window) {
		if (!AnalemmaHeirarchy.ctx) this.setContext();
		AnalemmaHeirarchy.shave = this.config.shave;
		let functionsToAdd = ['conj', 'midpoint', 'slope', 'perp', 'lerp', 'degToRad', 'Re', 'Im', 'add', 'sub', 'mult', 'div', 'distance', 'norm'];
		for (var f of functionsToAdd) {
			location[f] = this.setFunc(f);
		}
		location.riemannSum = Complex.riemannSum;
		location.animate = () => {};
		location.animate = () => {
			this.frameCount++;
			this.clear();

			for (var i = 0; i < this.animations.length; i++) {
				this.animations[i](this.frameCount);
			}
			try {
				location.requestAnimationFrame(location.animate);
			} catch (err) {}
		}
	}
	clear() {
		AnalemmaHeirarchy.ctx.fillStyle = '#0001';
		AnalemmaHeirarchy.ctx.fillRect(0, 0, 400, 400);
	}
	setFunc(func) {
		return (...args) => this.runParent(func, ...args);
	}
	runParent(func, ...args) {
		if (typeof args[0] === 'number') {
			return Complex[func](...args);
		}
		return args[0].constructor[func](...args);
	}
}

let Analemma = AnalemmaManager;

class AnalemmaHeirarchy {
	static ctx = null;
	constructor() {
		this.ctx = this.constructor.ctx;
	}
	toString() {
		return this.constructor.name;
	}
	shaveRoundoff(n){
	    return AnalemmaHeirarchy.shave?(Math.round(n*1e9))/1e9:n;
	}
}

class InputError extends Error {
	static errorCount = 0;
	constructor(message) {
		super(message);
		this.constructor.errorCount++;
		this.name = "Input Error"
	}
}

class RingError extends Error {
	static errorCount = 0;
	constructor(result = '', message = `Come on man.  Your result ${result} is outside of the ring your are working in.  Try adjoining another set to expand it or doing something less wrong.`) {
		super(message);
		this.constructor.errorCount++;
		this.name = "Ring Error"
	}
}

class ContextError extends Error {
	static errorCount = 0;
	constructor(location = 'this method', message = null) {
		super(message = 'Before using `' + location + '`, an HTML5 Canvas context must be given for drawing! Define one via the manager.');
		this.constructor.errorCount++;
		this.name = "Drawing Context Error"
	}
}

class ComplexInputError extends InputError {
	constructor(input = '', message) {
		super(message = `Input ${input} must be a Complex Number (of the Complex class), or an integer!`);
	}
}

class ZeroDivisionError extends InputError {
	constructor(message = "Input must not be equal to 0 while computing division!") {
		super(message);
	}
}


/** Yay number theory **/

let NumberTheory = {
	sieve(n) {
		var primes = [];
		for (var i = 0; i < n + 1; i++) {
			primes.push(true);
		}
		var p = 2;
		while (p * p <= n) {
			if (primes[p] === true) {
				for (var i = p * p; i < n + 1; i += p) {
					primes[i] = false;
				}
			}
			p += 1;
		}
		var lst = [];
		for (var i = 2; i < n; i++) {
			if (primes[i]) {
				lst.push(i);
			}
		}
		return lst;
	},
	p: [],
	get primes() {
		this.p = this.p.length > 0 ? this.p : this.sieve(1000000);
		return this.p;
	},
	GCD(a, b) {
		if (a === 0) return b;
		if (b === 0) return a;
		return this.GCD(b, a % b);
	},
	GCF(a, b) {
		return this.GCD(a, b);
	},
	isPrime(n) {
		return this.primes.indexOf(n) > -1;
	},
	factor(n) {
		let lst = [];
		if (n <= 1) {
			return lst;
		}
		if (this.primes.indexOf(n) != -1) {
			lst.push(n);
			return lst;
		}
		let primeFactor = 0;
		for (var i = 0; i < this.primes.length; i++) {
			if (n % this.primes[i] == 0) {
				primeFactor = this.primes[i];
			}
		}
		if (primeFactor == 0) return [];
		lst.push(primeFactor);
		lst.push(...this.factor(n / primeFactor));
		return lst;
	},
	getSumOfSquares(p) {
		if (p % 4 === 3) {
			return [0, 0];
		}
		if (p % 4 === 0) {
			let a = this.getSumOfSquares(p / 4);
			return [2 * a[0], 2 * a[1]];
		}

		for (let i = 1; i <= ~~Math.sqrt(p); i += 2) {
			let j = Math.sqrt(p - i * i);

			if (j === ~~j) {
				return [i, j];
			}
		}

		return [0, 0];
	}

};


/** Complex Number Class + Ring of Gaussian Integers **/

class Complex extends AnalemmaHeirarchy {
	constructor(real=0, imaginary=0) {
		super();
		if (real instanceof Complex) {
			this.real = real.real;
			this.imaginary = real.imaginary;
			return;
		}

		//real part of complex number, x component.
		this.real = this.shaveRoundoff(real);
		//Imaginary part of complex number, y component.
		this.imaginary = this.shaveRoundoff(imaginary);
		//May add distance/angle for polar form eventually

	}
	//Some aliases to make life easier for others who don't like complex numbers.
	get x() {
		return this.real;
	}
	get y() {
		return this.imaginary;
	}
	get a() {
		return this.real;
	}
	get b() {
		return this.imaginary;
	}
	set x(n) {
		this.real = n;
	}
	set y(n) {
		this.imaginary = n;
	}
	set a(n) {
		this.real = n;
	}
	set b(n) {
		this.imaginary = n;
	}

	static Re(z) {
		return z.x;
	}
	static Im(z) {
		return z.y;
	}
	
	//Constants
    static PI = new Complex(3.141592653589);
    static TAU = new Complex(3.141592653589*2);
    static zero = new Complex();
	static i = new Complex(0, 1);
    static EULER_MASCHERONI = 0.57721566490153286060651209008240243104215933593992;
    static GAMMA = new Complex(Complex.EULER_MASCHERONI);
    
	get str() {
		//Reject numbers that are not defined
		if (this.real === undefined || this.imaginary === undefined || this.real === null || this.imaginary === null) {
			return undefined;
		}
		//return either a+bi or a-bi
		if (this.imaginary >= 0) {
			return (this.real + "+" + this.imaginary + "i");
		} else {
			return (this.real + "" + this.imaginary + "i");
		}
	}
	display(x = 300, y = 300) {
		if (!this.ctx) {
			console.log(`(${this.x},${this.y})`);
			return;
		}
		this.ctx.fillText( /*`(${this.x},${this.y})`*/ this.str, x, y);
	}
	draw(size) {
		if (!this.ctx) throw new ContextError(this.draw.name);
		if (!size) {
			this.ctx.fillRect(this.x, this.y, 1, 1);
		} else {
			this.ctx.fillRect(this.x - size / 2, this.y - size / 2, size, size);
			//ctx.ellipse(this.x,this.y, size, size, 0,0,Math.PI*2);
		}
	}
	//Add two complex numbers together.
	//THIS IS A STATIC METHOD
	static add(a, b) {
		//Convert integers to the complex number class.
		if ((typeof a === 'number' || a instanceof Complex) && (typeof b === 'number' || b instanceof Complex)) {
			if (typeof a === 'number') {
				a = new Complex(a, 0);
			}
			if (typeof b === 'number') {
				b = new Complex(b, 0);
			}
			//Add real components and imaginary components of each.
			return new Complex(a.real + b.real, a.imaginary + b.imaginary);
		} else {
			//Type error
			throw new ComplexInputError(a + ', ' + b);
		}
	}
	//Call the static method but on the specific instance.
	add(n) {
		return Complex.add(this, n);
	}
	static sub(a, b) {
		//Just use the addition function and add a negative sign to one of the components.
		if (typeof b === 'number') {
			return Complex.add(a, -b);
		}
		if (b instanceof Complex) {
			return Complex.add(a, new Complex(-b.real, -b.imaginary));
		}
		throw new ComplexInputError(a + ', ' + b);
	}
	sub(n) {
		return Complex.sub(this, n);
	}
	//Multiplies two complex numbers together.
	//THIS IS A STATIC METHOD
	static mult(a, b) {
		if (typeof a === 'number') {
			a = new Complex(a, 0);
		}
		if (typeof b === 'number') {
			b = new Complex(b, 0);
		}
		if (a instanceof Complex && b instanceof Complex) {
			return new Complex(a.real * b.real - a.imaginary * b.imaginary, a.real * b.imaginary + a.imaginary * b.real);
		} else {
			throw new ComplexInputError(a + ', ' + b);
		}
	}
	mult(n) {
		return Complex.mult(this, n);
	}
	//Divides two complex numbers
	//THIS IS A STATIC METHOD
	static div(a, b) {
		if (typeof a === 'number') {
			a = new Complex(a, 0);
		}
		if (typeof b === 'number') {
			b = new Complex(b, 0);
		}
		if (a instanceof Complex && b instanceof Complex) {
			if (b.isZero) {
				throw new ZeroDivisionError();
			}
			if (a.real === b.real && a.imaginary === b.imaginary) {
				return new Complex(1, 0);
			}
			return new Complex((a.real * b.real + a.imaginary * b.imaginary) / (b.real * b.real + b.imaginary * b.imaginary), (a.imaginary * b.real - a.real * b.imaginary) / (b.real * b.real + b.imaginary * b.imaginary));
		} else {
			throw new ComplexInputError(a + ', ' + b);
		}
	}
	div(n) {
		return Complex.div(this, n);
	}
	get isZero() {
		return this.real === 0 && this.imaginary === 0;
	}
	static conj(n) {
		if (typeof n === 'number') {
			return new Complex(n, 0);
		}
		if (n instanceof Complex) {
			return new Complex(n.real, -n.imaginary);
		} else {
			throw new ComplexInputError();
		}
	}
	get conj() {
		return Complex.conj(this);
	}
	get floor() {
		return new Complex(Math.floor(this.real), Math.floor(this.imaginary));
	}
	static midpoint(a, b) {
		if (typeof a === 'number') {
			a = new Complex(a, 0);
		}
		if (typeof b === 'number') {
			b = new Complex(b, 0);
		}

		if (a instanceof Complex && b instanceof Complex) {
			return new Complex((a.real + b.real) / 2, (a.imaginary + b.imaginary) / 2);
		} else throw new ComplexInputError();
	}
	static norm(n) {
		return n.real * n.real + n.imaginary * n.imaginary;
	}
	get norm() {
		return Complex.norm(this);
	}
	static slope(a, b) {
		if (typeof a === 'number') {
			a = new Complex(a, 0);
		}
		if (typeof b === 'number') {
			b = new Complex(b, 0);
		}
		if (a instanceof Complex && b instanceof Complex) {
			if (a.real - b.real == 0) {
				throw "Division by zero error!";
			}
			return (b.imaginary - a.imaginary) / (b.real - a.real);
		} else {
			throw new ComplexInputError();
		}
	}
	static perp(a, b) {
		let s = Complex.slope(a, b);
		if (s === 0) {
			throw new ZeroDivisionError();
		}
		return -1 / s;
	}
	static distance(a, b) {
		if (typeof a === 'number') {
			a = new Complex(a, 0);
		}
		if (typeof b === 'number') {
			b = new Complex(b, 0);
		}
		if (a instanceof Complex && b instanceof Complex) {
			var x = a.real - b.real;
			var y = a.imaginary - b.imaginary;
			return Math.sqrt(x * x + y * y);
		} else throw new ComplexInputError();
	}
	get distance() {
		return Complex.distance(this, 0);
	}
	get magnitude() {
		return Complex.distance(this, 0);
	}
	static dot(a, b) {
        return a.real * b.real + a.imaginary * b.imaginary;
    }
    static innerProduct(a, b){
        return Complex.dot(a, b);
    }
    dot(n){
        return Complex.dot(this, n);
    }
    static ln(z) {
        return new Complex(Math.log(z.magnitude), Complex.arctangent(new Complex(0, 0), z));
    }
	static pow(z, w) {
        if (typeof w === "number") w = new Complex(w, 0);
        if (typeof z === "number") z = new Complex(w, 0);
        let a = z.real, b = z.imaginary, c = w.real, d = w.imaginary;
        let m = a * a + b * b;
        let p1 = Math.pow(m, c / 2);
        let p2 = Complex.e(new Complex(-d * z.argument, 0));
        let p3i = c * z.argument + 0.5 * d * Math.log(m);
        let p3 = new Complex(Math.cos(p3i), Math.sin(p3i));
        return p3.mult(p2.mult(p1));
    }
    pow(n) {
        return Complex.pow(this, n);
    }
	get argument() {
        return Complex.arctangent(Complex.zero, this);
    }
	static e(n = Complex.one) {
        let mag = Math.pow(Math.E, n.real);
        //Euler's formula
        return new Complex(
            mag * Math.cos(n.imaginary),
            mag * Math.sin(n.imaginary)
        );
    }
    static exp(z){
        return Complex.e(z);
    }
    static unity(omega,n=1){
        return Complex.pow(Complex.exp(Complex.i.mult(Complex.TAU).div(omega)),n);
    }
    static sqrt(z){
        return new Complex(Math.sqrt((z.magnitude+z.real)/2), Math.sign(z.imaginary)*Math.sqrt((z.magnitude-z.real)/2))
    }
    static expmod(x){
        if(x==0) return Complex.one;
        return new Complex(2*(Math.floor(x-1)%2)-1,0);
    }
    static one = new Complex(1,0);
    static factorial(n){
        let prod = 1;
        for(var i = 1; i <= n; i++){
            prod*=i;
        }
        return new Complex(prod,0);
    }
	//Linear Interpolation between two complex numbers
	static lerp(a, b, t) {
		if (typeof t != 'number' || t < 0 || t > 1) {
			throw "t parameter must be a real number between 0 and 1!";
		}
		if (typeof a == 'number' && typeof b == 'number') {
			return a * t + b * (1 - t);
		}
		if (a instanceof Complex && b instanceof Complex) {
			return a.mult(t).add(b.mult(1 - t));
		} else throw ComplexInputError();
	}
	static riemannSum(f, a, b, iter) {
		var sum = new Complex(0, 0);
		if (!f(a) instanceof Complex) throw "Callback function must return a Complex number!";
		var w = (b - a) / iter;
		for (var i = a; i < b; i += w) {
			var t = (f(i).add(f(i + w)).div(2));
			sum = sum.add(t.mult(w).div(b - a));
		}
		return sum;
	}
	//Logarithmic integral
	//WARNING: Branch Cut!!!  To eliminate this problem use approxLi
    static li(x){
        const a = Complex.ln(Complex.ln(x)), b1 = Complex.sqrt(x);
        let b2 = new Complex(0,0);
        for(let n = 1; n <= 15; n++){
            let innerSum = 0;
            for(var k = 0; k <= Math.floor((n-1)/2); k++){
                innerSum+=1/(2*k+1);
            } 
            if(innerSum === 0) innerSum = 1;
            let bottom = Complex.factorial(n).mult(Complex.pow(new Complex(2,0),n-1));
            let nextTerm = 
                Complex.expmod(n-1)
                .div(bottom)
                .mult(Complex.pow(Complex.ln(x), n))
                .mult(innerSum);
            b2 = b2.add(nextTerm);
        }
        return a.add(b1.mult(b2)).add(Complex.EULER_MASCHERONI)
    }
	static arctangent(p1, p2) {
        let ang = Math.atan((p2.imaginary - p1.imaginary) / (p2.real - p1.real));
        if (p2.real < p1.real)
            if (p2.imaginary > p1.imaginary) return Math.PI + ang;
            else return ang - Math.PI;
        return ang;
    }
    //Moebius transform or inversion or something
    static mobius(max){
        var root = Math.floor(Math.sqrt(max));
        let mu = [];
        for(var i = 0; i <= max; i++) mu.push(1);
        for(var i = 2; i <= root; i++){
            if(mu[i]==1){
                for(var j = i; j <=max; j+=i){
                    mu[j]*=-i;
                }
                for(var j = i*i; j < max; j+=i*i){
                    mu[j]=0;
                }
            }
        }
        for(var i = 2; i <=max; i++){
            if(mu[i]==i) mu[i]=1;
            else if(mu[i]==-i) mu[i]=-1;
            else if(mu[i]<0) mu[i]=1;
            else if(mu[i]>0) mu[i]=-1
        }
        return mu;
    }
    static easyZeta(n){
        let total = 0;
        for(var i = 1; i <100; i++){
            total+=1/Math.pow(i,n);
        }
        return total;
    }
	static degToRad(n) {
		return n * Math.PI / 180;
	}
	static approxLi(x,rho){
        let X = rho.mult(Complex.ln(new Complex(x,0)));
        return Complex.e(X).div(X).mult(-2).real;
    }
    //Thank you Ramanujan!!
    static ei(z){
        let a = Complex.ln(Complex.one.div(z)).mult(-0.5);
        let b = Complex.ln(z).mult(0.5);
        let sum = Complex.zero; 
        for(var n = 1; n < 30; n++){
            sum = sum.add(Complex.pow(z,new Complex(n,0)).div(Complex.factorial(n).mult(n)));
        }
        return a.add(b).add(sum).add(Complex.EULER_MASCHERONI);
    }
    //I think this is Riemann's prime counting function or something, but just one harmonic maybe?  I don't even know if it works.
    static R(x, p){
        let total = new Complex(1,0);
        for(var n = 1; n < 200; n++){
            if(!p){
                total = total.add(
                    Complex.pow(Complex.ln(x),n).div(
                        Complex.factorial(n).mult(n).mult(Complex.easyZeta(n+1))
                        )
                    )
            }else{
                total = total.add(
                    Complex.ei(
                        p.div(n).mult(Complex.ln(new Complex(x,0)))
                    ).mult(mobius[n]/n)
                );
            }
        }
        return total;
    }
    static sin(z){
        return Complex.e(Complex.i.mult(z.mult(-1))).mult(Complex.i.mult(0.5)).sub(Complex.e(Complex.i.mult(z)).mult(Complex.i.mult(0.5)));
    }
    static cos(z){
        return Complex.e(Complex.i.mult(z.mult(-1))).mult(0.5).add(Complex.e(Complex.i.mult(z)).mult(0.5));
    }
    static tan(z){
        return Complex.sin(z).div(Complex.cos(z));
    }
    static sec(z){
        return Complex.one.div(Complex.cos(z));
    }
    static csc(z){
        return Complex.one.div(Complex.sin(z));
    }
    static cot(z){
        return Complex.cos(z).div(Complex.sin(z));
    }
    static sinh(z){
        return Complex.e(z).mult(0.5).sub(Complex.e(z.mult(-1)).mult(0.5));
    }
    static cosh(z){
        return Complex.e(z).mult(0.5).add(Complex.e(z.mult(-1)).mult(0.5));
    }
    static tanh(z){
        return Complex.sinh(z).div(Complex.cosh(z));
    }
    static coth(z){
        return Complex.cosh(z).div(Complex.sinh(z));
    }
    static sech(z){
        return Complex.one.div(Complex.cosh(z));
    }
    static csch(z){
        return Complex.one.div(Complex.sinh(z));
    }
    static gamma(x,N=1000){
        let m = Complex.pow(new Complex(N,0),x), product = new Complex(1,0);
        for(var k = 1; k <= N; k++){
            let k0 = new Complex(k,0);
            product=product.mult(k0.div(x.add(k)));
        }
        return m.mult(product);
    }
    static otherZeta(s){
        var iter = 2000;
        var one = Complex.one;
        var m = one.div( one.sub( Complex.pow(new Complex(2,0),one.sub(s)) ) );
        var sum = new Complex(0,0);
        var sigmadd;
        for(var n = 1; n < iter; n++){
            sigmadd = Complex.expmod(n).div(Complex.pow(new Complex(n,0),s));
            sum = sum.add(sigmadd);
        }
        return m.mult(sum).mult(-1);
    }
    static nCr(n,k){
        return Complex.factorial(n).div(
            Complex.factorial(k).mult(Complex.factorial(n-k))
        );  
    }
    static continuedZeta(s){
        let a = Complex.one.div(s.sub(1));
        let total = Complex.zero;
        for(var n = 0; n < 20; n++){
            let innerSum = Complex.zero;
            for(var k = 0; k < n; k++){
                innerSum = innerSum.add(Complex.nCr(n,k).mult(
                Complex.expmod(k).div(Complex.pow(new Complex(k+1,0),s.sub(1)))));
            }
            total = total.add(innerSum.mult(1/(n+1)));
        }
        return a.mult(total);
    }
    //Zeta zeros up to 500.  You never know when you might need them.
    static zetaZeros = [14.134725142 , 21.022039639 , 25.010857580 , 30.424876126 , 32.935061588 , 37.586178159 , 40.918719012 , 43.327073281 , 48.005150881 , 49.773832478 , 52.970321478 , 56.446247697 , 59.347044003 , 60.831778525 , 65.112544048 , 67.079810529 , 69.546401711 , 72.067157674 , 75.704690699 , 77.144840069 , 79.337375020 , 82.910380854 , 84.735492981 , 87.425274613 , 88.809111208 , 92.491899271 , 94.651344041 , 95.870634228 , 98.831194218 ,101.317851006 ,103.725538040 ,105.446623052 ,107.168611184 ,111.029535543 ,111.874659177 ,114.320220915 ,116.226680321 ,118.790782866 ,121.370125002 ,122.946829294 ,124.256818554 ,127.516683880 ,129.578704200 ,131.087688531 ,133.497737203 ,134.756509753 ,138.116042055 ,139.736208952 ,141.123707404 ,143.111845808 ,146.000982487 ,147.422765343 ,150.053520421 ,150.925257612 ,153.024693811 ,156.112909294 ,157.597591818 ,158.849988171 ,161.188964138 ,163.030709687 ,165.537069188 ,167.184439978 ,169.094515416 ,169.911976479 ,173.411536520 ,174.754191523 ,176.441434298 ,178.377407776 ,179.916484020 ,182.207078484 ,184.874467848 ,185.598783678 ,187.228922584 ,189.416158656 ,192.026656361 ,193.079726604 ,195.265396680 ,196.876481841 ,198.015309676 ,201.264751944 ,202.493594514 ,204.189671803 ,205.394697202 ,207.906258888 ,209.576509717 ,211.690862595 ,213.347919360 ,214.547044783 ,216.169538508 ,219.067596349 ,220.714918839 ,221.430705555 ,224.007000255 ,224.983324670 ,227.421444280 ,229.337413306 ,231.250188700 ,231.987235253 ,233.693404179 ,236.524229666 ,237.769820481 ,239.555477573 ,241.049157796 ,242.823271934 ,244.070898497 ,247.136990075 ,248.101990060 ,249.573689645 ,251.014947795 ,253.069986748 ,255.306256455 ,256.380713694 ,258.610439492 ,259.874406990 ,260.805084505 ,263.573893905 ,265.557851839 ,266.614973782 ,267.921915083 ,269.970449024 ,271.494055642 ,273.459609188 ,275.587492649 ,276.452049503 ,278.250743530 ,279.229250928 ,282.465114765 ,283.211185733 ,284.835963981 ,286.667445363 ,287.911920501 ,289.579854929 ,291.846291329 ,293.558434139 ,294.965369619 ,295.573254879 ,297.979277062 ,299.840326054 ,301.649325462 ,302.696749590 ,304.864371341 ,305.728912602 ,307.219496128 ,310.109463147 ,311.165141530 ,312.427801181 ,313.985285731 ,315.475616089 ,317.734805942 ,318.853104256 ,321.160134309 ,322.144558672 ,323.466969558 ,324.862866052 ,327.443901262 ,329.033071680 ,329.953239728 ,331.474467583 ,333.645378525 ,334.211354833 ,336.841850428 ,338.339992851 ,339.858216725 ,341.042261111 ,342.054877510 ,344.661702940 ,346.347870566 ,347.272677584 ,349.316260871 ,350.408419349 ,351.878649025 ,353.488900489 ,356.017574977 ,357.151302252 ,357.952685102 ,359.743754953 ,361.289361696 ,363.331330579 ,364.736024114 ,366.212710288 ,367.993575482 ,368.968438096 ,370.050919212 ,373.061928372 ,373.864873911 ,375.825912767 ,376.324092231 ,378.436680250 ,379.872975347 ,381.484468617 ,383.443529450 ,384.956116815 ,385.861300846 ,387.222890222 ,388.846128354 ,391.456083564 ,392.245083340 ,393.427743844 ,395.582870011 ,396.381854223 ,397.918736210 ,399.985119876 ,401.839228601 ,402.861917764 ,404.236441800 ,405.134387460 ,407.581460387 ,408.947245502 ,410.513869193 ,411.972267804 ,413.262736070 ,415.018809755 ,415.455214996 ,418.387705790 ,419.861364818 ,420.643827625 ,422.076710059 ,423.716579627 ,425.069882494 ,427.208825084 ,428.127914077 ,430.328745431 ,431.301306931 ,432.138641735 ,433.889218481 ,436.161006433 ,437.581698168 ,438.621738656 ,439.918442214 ,441.683199201 ,442.904546303 ,444.319336278 ,446.860622696 ,447.441704194 ,449.148545685 ,450.126945780 ,451.403308445 ,453.986737807 ,454.974683769 ,456.328426689 ,457.903893064 ,459.513415281 ,460.087944422 ,462.065367275 ,464.057286911 ,465.671539211 ,466.570286931 ,467.439046210 ,469.536004559 ,470.773655478 ,472.799174662 ,473.835232345 ,475.600339369 ,476.769015237 ,478.075263767 ,478.942181535 ,481.830339376 ,482.834782791 ,483.851427212 ,485.539148129 ,486.528718262 ,488.380567090 ,489.661761578 ,491.398821594 ,493.314441582 ,493.957997805 ,495.358828822 ,496.429696216 ,498.580782430 ,500.309084942];
}

class GaussianInteger extends Complex {
	constructor(real, imaginary) {
		super(real, imaginary);
		this.checkRing();
	}
	checkRing() {
		if (this.real != Math.round(this.real)) {
			throw new RingError(this.str);
			this.real = Math.floor(this.real);
		}
		if (this.imaginary != Math.round(this.imaginary)) {
			throw new RingError(this);
			this.imaginary = Math.floor(this.imaginary);
		}

	}
	static add(a, b) {
		return new GaussianInteger(super.add(a, b));
	}
	add(n) {
		return GaussianInteger.add(this, n);
	}
	static mult(a, b) {
		return new GaussianInteger(super.mult(a, b));
	}
	mult(n) {
		return GaussianInteger.mult(this, n);
	}
	static sub(a, b) {
		return new GaussianInteger(super.sub(a, b));
	}
	sub(n) {
		return GaussianInteger.sub(this, n);
	}
	static div(a, b) {
		return new GaussianInteger(super.div(a, b));
	}
	div(n) {
		return GaussianInteger.div(this, n);
	}
	static norm(n) {
		return new GaussianInteger(super.norm(n));
	}
	get norm() {
		return GaussianInteger.norm(this);
	}
	static conj(n) {
		return new GaussianInteger(super.conj(n));
	}
	get conj() {
		return GaussianInteger.conj(this);
	}
	get conjugate() {
		return GaussianInteger.conj(this);
	}
	static isAssociate(a, b) {
		if (
			a.str == b.str ||
			a.mult(Complex.i).str == b.str ||
			a.mult(-1).str == b.str || a.mult(Complex.i.mult(-1)).str == b.str) {
			return true;
		}
		return false;

	}
	isAssociate(n) {
		return GaussianInteger.isAssociate(this, n);
	}
	static isUnit(n) {
		return n.norm.real == 1;
	}

	static get units() {
		return [new GaussianInteger(1, 0), new GaussianInteger(0, 1), new GaussianInteger(-1, 0), new GaussianInteger(0, -1)];
	}

	get isUnit() {
		return GaussianInteger.isUnit(this);
	}

	get isPositive() {
		return this.real >= 0 && this.imaginary >= 0;
	}

	static lstToStr(lst) {
		let strs = [];
		for (let c of lst) {
			strs.push(c.str);
		}
		return strs;
	}

	static sum(lst) {
		let total = new GaussianInteger(0, 0);
		for (var i = 0; i < lst.length; i++) {
			total = total.add(lst[i]);
		}
		return total;
	}
	static prod(lst) {
		let total = new GaussianInteger(1, 0);
		for (var i = 0; i < lst.length; i++) {
			total = total.mult(lst[i]);
		}
		return total;
	}
	static factor(G) {

		let n = G.norm,
			q, pfactors = [],
			p = NumberTheory.factor(n.real);
		if (n <= 1) return [];
		if (p.length < 2) return [G];
		let flip = false;
		while (p.length >= 1) {
			if (p[0] === 2) {
				q = new GaussianInteger(1, 1);
				if (flip) q = q.conj;
				p.splice(0, 1);
				flip = true;
			} else if (p[0] % 4 === 3) {
				q = p[0];
				p.splice(0, 1);
				for (var i = 0; i < p.length; i++) {
					if (p[i] === q) {
						p.splice(i, 1);
						break;
					}
				}
			} else {

				let k = 0;
				for (let n0 = 2; n0 <= p[0] - 1; n0++) {

					if (Math.pow(n0, (p[0] - 1) / 2) % p[0] === p[0] - 1) {

						k = Math.pow(n0, (p[0] - 1) / 4);
						break;
					}
				}
				q = GaussianInteger.GCD(new Complex(p[0]), new Complex(k, 1));
				if (!GaussianInteger.mod(G, q).isZero) {
					q = q.conj;
				}
				p.splice(0, 1);
			}
			G = G.div(q);
			pfactors.push(new GaussianInteger(q));
		}
		return pfactors;
	}

	get q1() {
		return new GaussianInteger(Math.abs(this.real), Math.abs(this.imaginary));
	}

	get factors() {
		return GaussianInteger.factor(this);
	}

	get properFactors() {
		let divs = [];
		let alternates = [];
		for (var i = 0; i <= this.norm.real / 2; i++) {
			if (this.norm.real % i === 0) {
				let a = NumberTheory.getSumOfSquares(i);
				let b = new GaussianInteger(a[0], a[1]);
				if (!b.isZero) {
					try {
						alternates.push(this.div(b));
						divs.push(b);
					} catch (RingErrorDUmmy) {
					}
					try {
						let b1 = new GaussianInteger(a[1], a[0]);
						alternates.push(this.div(b1));
						if (b1.real != 0) {
							divs.push(b1);
						}
					} catch (RingErr) {}
					try {
						let b2 = new GaussianInteger(i, 0);
						alternates.push(this.div(b2));
						if (b2.real != 1) {
							divs.push(b2);
						}
					} catch (RingErr) {}
				}
			}
		}
		for (let a of alternates) {
			while (!a.isPositive) a = a.mult(GaussianInteger.i);
			if (GaussianInteger.lstToStr(divs).indexOf(a.str) === -1 && a.str != this.str) divs.push(a);
		}
		return divs;
	}
	static mod(a, b) {
		let q = new Complex(a).div(b).floor;
		return a.sub(b.mult(q));

	}
	static GCD(a, b) {
		if (a.isZero) return b;
		if (b.isZero) return a;
		return this.GCD(b, GaussianInteger.mod(a, b));
	}
	static GCF(a, b) {
		return GaussianInteger.GCD(a, b);
	}
	static sigma(G) {
		return GaussianInteger.sum(G.properFactors);
	}
	static iterateSigma(G, l) {
		let GList = [G];
		while (!G.isZero) {
			G = GaussianInteger.sigma(G);
			GList.push(G);
			if (G.norm.real > 100000) return GList;
		}
		return GList;
	}
}


/** Line Class **/

class Line extends AnalemmaHeirarchy {
	constructor(p1, p2) {
		super();
		this.p1 = p1;
		this.p2 = p2;
	}
	//Draw the line.
	draw() {
		if (!this.ctx) throw new ContextError(this.draw.name);
		this.ctx.beginPath();
		this.ctx.moveTo(this.p1.x, this.p1.y);
		this.ctx.lineTo(this.p2.x, this.p2.y);
		this.ctx.stroke();
	}
	//Some getters for properties of the line.  Used a lot in the shadow raycasting.
	get slope() {
		return Complex.slope(this.p1, this.p2);
	}
	get angle() {
		return Complex.arctangent(this.p1, this.p2);
	}
	get perp() {
		return Complex.perp(this.p1, this.p2);
	}
	//Where two lines intersect (collisions).
	intersection(l) {
		let m1 = this.slope;
		let m2 = l.slope;
		let xval = (-m1 * this.p1.x + this.p1.y + m2 * l.p1.x - l.p1.y) / (m2 - m1);
		//Sometimes if the lines are vertical, you end up dividing by zero.  You get some pesky singularities as a result.
		if (m1 === Infinity) {
			xval = this.p1.x;
		}
		if (m2 === Infinity) {
			xval = l.p1.x;
		}
		let yval = m1 * (xval - this.p1.x) + this.p1.y;
		if (m1 === Infinity) {
			yval = m2 * (xval - l.p1.x) + l.p1.y;
		}
		if (!xval || xval === Infinity) {
			return 'vert';
		}
		if (!yval || yval === Infinity) {
			return 'vert';
		}
		return new Complex(xval, yval);
	}
	isIntersecting(l) {
		//Given an intersection point, see if it lies on the line segment.
		let x = false,
			y = false,
			P = l.p1,
			Q = l.p2,
			C = this.intersection(l);
		//if (xraymode) {
		//    this.draw();
		//}
		if ((P.real >= C.real && Q.real <= C.real) || (P.real <= C.real && Q.real >= C.real)) {
			x = true;
		}
		if ((P.imaginary >= C.imaginary && Q.imaginary <= C.imaginary) || (P.imaginary <= C.imaginary && Q.imaginary >= C.imaginary)) {
			y = true;
		}
		if (this.p1.x === this.p2.x) {
			//Dealin with more wonky singularities
			if (C === 'vert') {
				if (Complex.distance(player.position, new Complex(this.p1.x, player.position.y)) < 5) {
					x = true;
					if ((this.p1.y > player.position.y && this.p2.y < player.position.y) || (this.p2.y > player.position.y && this.p1.y < player.position.y)) {
						y = true;
					}
				}
			}
		}
		return x && y;
	}
	isIntersecting2(l) {
		return this.isIntersecting(l) && l.isIntersecting(this);
	}
}

class TransformationLine extends AnalemmaHeirarchy{
    constructor(f0, f1,dt){
        super();
        this.f0 = f0;
        this.f1 = f1;
        this.dt = dt;
        this.ft = 0;
        this.ts = 0.9999; 
        this.range = 2;
        this.scale = 100; 
    } 
    getValue(x){
        return this.f0(x).mult((1-this.ft)).add(this.f1(this.f0(x)).mult(this.ft));
    }
    draw(){
        let initPos = this.getValue(-this.range).mult(this.scale).add(new Complex(200,200));
        ctx.beginPath();
        ctx.moveTo(initPos.real, initPos.imaginary);
        for(let t = -this.range; t <= this.range+this.dt; t+=this.dt){
            let nextValue = this.getValue(t).mult(this.scale).add(new Complex(200,200));
            ctx.lineTo(nextValue.real, nextValue.imaginary);
            ctx.strokeStyle = `rgb(0,${255-255*(this.f0(t).real+this.range)/(2*this.range)},${255*(this.f0(t).real+this.range)/(2*this.range)})`;
            let a = this.f0(t).real;
            if(a<1) ctx.strokeStyle = 'rgb(255,255,255)';
            if(a>=0.96) ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(nextValue.real, nextValue.imaginary);
        }
    }
    tick(){
        this.ft=Complex.lerp(this.ft, 1, this.ts).real; 
    }
}
        
class TransformationGrid extends AnalemmaHeirarchy{
    constructor(f,dt,gridSize){
        super();
        this.f = f;
        this.dt = dt;
        this.gridSize = gridSize;
        this.range = 4;
        this.lines = [];
        for(let x = -this.range; x<this.range; x+=gridSize){
            this.lines.push(new TransformationLine((t)=>{
                    return new Complex(x,t);
                }, f, dt));  
        }
        for(let y = -this.range; y<this.range; y+=gridSize){
            this.lines.push(new TransformationLine((t)=>{
                return new Complex(t,y);
            }, f, dt));  
        }
        for(let l of this.lines){
            l.range = this.range;
        }
    }
    update(){
        for(let l of this.lines){
            l.draw();
            l.tick();
            l.ts*=0.999
        }
    }
}

