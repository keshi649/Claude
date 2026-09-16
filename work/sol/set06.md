[1]
由高斯公式，$\mathrm{div}=\frac{\partial}{\partial x}[xf(z)]+\frac{\partial}{\partial y}[zf(x)]+\frac{\partial}{\partial z}[xf(y)]=f(z)$，故
$$I(t)=\iiint_\Omega f(z)\,dV .$$
$\Omega$ 是球心 $(0,t,0)$、半径 $t$ 的球体，$t\to0^+$ 时 $f(z)=f(0)+f'(0)z+o(z)$，而 $\iiint_\Omega z\,dV=0$（形心的 $z$ 坐标为 $0$），
$$\lim_{t\to0^+}\frac{I(t)}{t^3}=\lim_{t\to0^+}\frac{f(0)\cdot\frac43\pi t^3+o(t^3)}{t^3}=\frac{4\pi}{3}.$$

[2]
由 $\lambda\mathrm e^{-\lambda}=\frac{\lambda^2}{2}\mathrm e^{-\lambda}$ 得 $\lambda=2$，故
$$P\{X>1\}=1-\mathrm e^{-2}-2\mathrm e^{-2}=1-3\mathrm e^{-2}.$$

[3]
曲线与区域关于 $y=x$ 对称，而 $(x-y)^3$ 在交换 $x,y$ 时变号，故 $\iint_D(x-y)^3d\sigma=0$，$I=S(D)$．
令 $y=tx\;(t\geqslant0)$，代入 $(x+y)^3=xy$ 得 $x=\dfrac{t}{(1+t)^3}$，且 $x\,dy-y\,dx=x^2\,dt$，
$$S=\frac12\oint(x\,dy-y\,dx)=\frac12\int_0^{+\infty}\frac{t^2}{(1+t)^6}dt=\frac12\cdot\frac1{30}=\frac1{60}.$$
故 $I=\dfrac{1}{60}$．

[4]
设 $X,Y$ 独立同服从 $U[0,1]$，$Z=|X-Y|$．$F_Z(z)=1-(1-z)^2\;(0\leqslant z\leqslant1)$，故
$$f_Z(z)=\begin{cases}2(1-z),&0\leqslant z\leqslant1,\\0,&\text{其他}.\end{cases}$$

[5]
定义域：$x>0$ 或 $x<-\frac12$．
$x\to+\infty$：$\sqrt{4x^2+x}=2x+\frac14+o(1)$，$\ln\big(2+\frac1x\big)=\ln2+\frac{1}{2x}+o\big(\frac1x\big)$，
$$y=2x\ln2+1+\frac{\ln2}{4}+o(1)\Longrightarrow y=(2\ln2)x+1+\frac{\ln2}{4};$$
$x\to-\infty$：同理 $\sqrt{4x^2+x}=-2x-\frac14+o(1)$，得 $y=-(2\ln2)x-1-\dfrac{\ln2}{4}$；
$x\to\big(-\frac12\big)^-$：$\ln\big(2+\frac1x\big)\to-\infty$ 而根式趋于 $\frac{1}{\sqrt2}$，故 $x=-\dfrac12$ 为铅直渐近线．
（$x\to0^+$ 时 $y\to0$，无渐近线．）共 $3$ 条．

[6]
由 $a_n=\ln(a_n+\mathrm e^{b_n})$ 得 $\mathrm e^{b_n}=\mathrm e^{a_n}-a_n$．
当 $a_n\to0$ 时 $\mathrm e^{b_n}=1+\frac{a_n^2}{2}+o(a_n^2)$，即 $b_n\sim\frac{a_n^2}{2}$．
A、C、D 均正确（$\sum a_n$ 收敛 $\Rightarrow a_n\to0\Rightarrow\sum b_n,\sum b_n^2$ 收敛）．
B 错：取 $a_n=n^{-0.9}$，则 $\sum a_n$ 发散而 $b_n\sim\frac12n^{-1.8}$，$\sum b_n$ 收敛．选 **B**．

[7]
由 $\mathrm r(A)=s\leqslant n$ 与 $\mathrm r(B)=n\leqslant s$ 得 $s=n$，故 $A,B,AB$ 都是 $n$ 阶可逆矩阵．
A、B、C 中的分块矩阵秩均为 $2n$，只有零解；而 D 经列变换 $c_2-c_1B$ 得
$$\begin{pmatrix}A&AB\\E&B\end{pmatrix}\to\begin{pmatrix}A&O\\E&O\end{pmatrix},\qquad \mathrm r=n<2n ,$$
故有非零解．选 **D**．

[8]
$|\sin t|$ 以 $\pi$ 为周期且一个周期上的积分为 $2$，故
$$\lim_{x\to+\infty}\frac{1}{x}\int_0^x|\sin t|dt=\frac{2}{\pi}.$$

[9]
置换矩阵是正交的 $0$-$1$ 矩阵：$A^{\mathrm T}=A^{-1}$ 仍是置换矩阵，①②正确．
而 $A^*=|A|A^{-1}=\pm A^{-1}$，当 $|A|=-1$（奇数次互换）时 $A^*$ 的元素含 $-1$，不是置换矩阵，③错；
$A^{-1}-A^*=(1-|A|)A^{-1}$ 未必为零，④错．选 **C**．

[10]
（Ⅰ）方程化为 $y'+\frac{y}{x^2}=\mathrm e^{1/x}$，积分因子 $\mathrm e^{-1/x}$：$(y\mathrm e^{-1/x})'=1$，$y=(x+C)\mathrm e^{1/x}$；
由 $y(1)=3\mathrm e$ 得 $C=2$，即 $y=(x+2)\mathrm e^{\frac1x}$．
$x\to0^+$ 时 $y\to+\infty$，得铅直渐近线 $x=0$；$x\to+\infty$ 时 $y=x+3+o(1)$，得斜渐近线 $y=x+3$．
（Ⅱ）$y'=\mathrm e^{\frac1x}\dfrac{(x-2)(x+1)}{x^2}$，故 $y$ 在 $(0,2)$ 减、$(2,+\infty)$ 增，最小值 $y(2)=4\sqrt{\mathrm e}$，且两端趋于 $+\infty$．
故 $k>4\sqrt{\mathrm e}$ 时有 $2$ 个交点；$k=4\sqrt{\mathrm e}$ 时 $1$ 个；$0<k<4\sqrt{\mathrm e}$ 时无交点．

[11]
取定球为 $x^2+y^2+z^2=2az$（球心 $(0,0,a)$、半径 $a$），动球心取原点：$x^2+y^2+z^2=R^2$．
动球在定球内的部分满足 $R^2\leqslant2az$，即 $z\geqslant\frac{R^2}{2a}$，是球冠，面积
$$S(R)=2\pi R\Big(R-\frac{R^2}{2a}\Big)=2\pi R^2-\frac{\pi R^3}{a}.$$
$S'(R)=\pi R\big(4-\frac{3R}{a}\big)=0\Rightarrow R=\frac{4a}{3}$（极大）．故 $R=\dfrac{4a}{3}$ 时面积最大，最大值 $\dfrac{32\pi a^2}{27}$．

[12]
设 $k_1\alpha_1+k_2\alpha_2+k_3\alpha_3=0$．用 $A-E$ 作用（注意 $(A-E)\alpha_1=-3\alpha_1,\;(A-E)\alpha_2=0,\;(A-E)\alpha_3=\alpha_2$）：
$$-3k_1\alpha_1+k_3\alpha_2=0 .$$
再用 $A-E$ 作用得 $9k_1\alpha_1=0$，故 $k_1=0$；代回得 $k_3\alpha_2=0\Rightarrow k_3=0$；最后 $k_2\alpha_2=0\Rightarrow k_2=0$．
故 $\alpha_1,\alpha_2,\alpha_3$ 线性无关．

[13]
$f'_x=-(1+\mathrm e^y)\sin x=0\Rightarrow x=k\pi$；$f'_y=\mathrm e^y(\cos x-1-y)=0\Rightarrow y=\cos x-1$．
驻点：$(2k\pi,0)$ 与 $((2k+1)\pi,-2)$．在驻点处 $f''_{xx}=-(1+\mathrm e^y)\cos x,\;f''_{xy}=-\mathrm e^y\sin x=0,\;f''_{yy}=-\mathrm e^y$．
$(2k\pi,0)$：$AC-B^2=(-2)(-1)=2>0,\;A<0$，取**极大值 $f=2$**；
$((2k+1)\pi,-2)$：$AC-B^2=-(1+\mathrm e^{-2})\mathrm e^{-2}<0$，非极值．

[14]
当 $t\to-1$ 时 $x,y\to\infty$．
$$k=\lim_{t\to-1}\frac yx=\lim_{t\to-1}t=-1,\qquad b=\lim_{t\to-1}(y+x)=\lim_{t\to-1}\frac{t^2+t}{1+t^3}=\lim_{t\to-1}\frac{t}{1-t+t^2}=-\frac13 .$$
故斜渐近线为 $y=-x-\dfrac13$．

[15]
$(1+ax^2)^{\frac13}-1\sim\frac{a}{3}x^2$，$\cos x-1\sim-\frac{x^2}{2}$，等价要求 $\frac a3=-\frac12$，故 $a=-\dfrac32$．

[16]
$A,B,C$ 的特征值都是 $2,2,1$．
$\mathrm r(A-2E)=1\Rightarrow\lambda=2$ 有 $2$ 个线性无关特征向量，$A$ 可对角化，$A\sim C$；
$\mathrm r(B-2E)=2\Rightarrow\lambda=2$ 只有 $1$ 个，$B$ 不可对角化，$B\not\sim C$．选 **A**．

[17]
$\{X_i^2\}$ 独立同分布且期望存在，由辛钦大数定律 $\frac1n\sum X_i^2\xrightarrow{P}E(X^2)$，即
$$\lim_{n\to\infty}P\Big\{\Big|\frac1n\sum X_i^2-E(X_i^2)\Big|<\varepsilon\Big\}=1 .$$
选 **C**．

[18]
（Ⅰ）视 $x=x(y)$：$\dfrac{dy}{dx}=\dfrac{1}{x'}$，$y''=-\dfrac{x''}{(x')^3}$，代入原方程并乘以 $(x')^3$ 得
$$x''-4x=\mathrm e^{2y}.$$
（Ⅱ）齐次解 $C_1\mathrm e^{2y}+C_2\mathrm e^{-2y}$；共振特解 $\frac y4\mathrm e^{2y}$．故通解
$$x=C_1\mathrm e^{2y}+C_2\mathrm e^{-2y}+\frac{y}{4}\mathrm e^{2y}.$$

[19]
（Ⅰ）通项 $=\dfrac{\sqrt[n]{n}}{(1+\frac{1}{n^2})^n}\to1\neq0$，**发散**．
（Ⅱ）比值 $\to a$：$0<a<1$ 收敛；$a>1$ 发散；$a=1$ 时为 $\sum\frac{1}{n^p}$，$p>1$ 收敛、$p\leqslant1$ 发散．
（Ⅲ）$\int_0^n\sqrt{1+x^3}dx\sim\frac25n^{\frac52}$，通项 $\sim\frac52n^{-\frac52}$，**收敛**．
（Ⅳ）裂项：部分和 $=a-a^{\frac{1}{N+1}}\to a-1$，**收敛**（和为 $a-1$）．
（Ⅴ）$\frac1n-\ln(1+\frac1n)\sim\frac{1}{2n^2}$，**收敛**．
（Ⅵ）$\sqrt[n]a-\sqrt{1+\frac1n}=\frac{\ln a-\frac12}{n}+O\big(\frac{1}{n^2}\big)$，故 $a\neq\sqrt{\mathrm e}$ 时发散，$a=\sqrt{\mathrm e}$ 时收敛．

[20]
$f_X(x)=\int_0^{+\infty}x\mathrm e^{-x(1+y)}dy=\mathrm e^{-x}\;(x>0)$，即 $X\sim E(1)$，$EX=1$．故
$$P\{X>2\mid X>1\}=\frac{\mathrm e^{-2}}{\mathrm e^{-1}}=\mathrm e^{-1}$$
（$X$ 为连续型，不等号取 $>$ 或 $\geqslant$ 结果相同）．

[21]
$y+1\geqslant\frac{2}{1+x}\iff x+y+xy\geqslant1\iff y\geqslant\frac{1-x}{1+x}$．记 $D_2$ 为曲线下方部分，
$$\iint_{D_2}\frac{2}{1+x}d\sigma=2\int_0^1\frac{1-x}{(1+x)^2}dx=2(1-\ln2),$$
$$\iint_D(y+1)d\sigma=\frac13+\frac\pi4,\qquad \iint_{D_2}(y+1)d\sigma=\int_0^1\Big[\frac{g^2}{2}+g\Big]dx=\frac12\quad\Big(g=\frac{1-x}{1+x}\Big).$$
故
$$I=\Big(\frac13+\frac\pi4-\frac12\Big)+2(1-\ln2)=\frac\pi4+\frac{11}{6}-2\ln2 .$$

[22]
矩估计用样本二阶原点矩代替总体二阶原点矩：
$$\widehat{E(X^2)}=\frac1n\sum_{i=1}^nX_i^2=\overline X^2+\frac1n\sum_{i=1}^n(X_i-\overline X)^2 .$$
选 **A**．

[23]
$$\mathrm{div}\,\mathbf A=(x^2+2xy+2xz)+(y^2+2yz)+z^2=x^2+y^2+z^2+2(xy+xz+yz).$$
立体关于 $z$ 轴旋转对称，含 $xy,xz,yz$ 的积分均为 $0$，故
$$\Phi=\iiint_\Omega(x^2+y^2+z^2)dV=\int_0^{2\pi}\!\!\int_0^{\frac\pi3}\!\!\int_0^{4\cos\varphi}\rho^4\sin\varphi\,d\rho\,d\varphi\,d\theta
=2\pi\cdot\frac{1024}{5}\cdot\frac{63}{384}=\frac{336\pi}{5}.$$

[24]
用分块合同变换（舒尔补）：
$$\begin{pmatrix}E&0\\-\alpha^{\mathrm T}&1\end{pmatrix}\begin{pmatrix}A+\alpha\alpha^{\mathrm T}&\alpha\\\alpha^{\mathrm T}&1\end{pmatrix}\begin{pmatrix}E&-\alpha\\0&1\end{pmatrix}=\begin{pmatrix}A&0\\0&1\end{pmatrix}.$$
$A=\begin{pmatrix}-1&1\\1&1\end{pmatrix}$ 的特征值为 $\pm\sqrt2$，故正、负惯性指数分别为 $2,1$，规范形 $y_1^2+y_2^2-y_3^2$．选 **C**．

[25]
记 $u=(1,2,3)^{\mathrm T},\;v=(3,2,1)^{\mathrm T}$，则 $A=\begin{pmatrix}O&u\\v^{\mathrm T}&0\end{pmatrix}$，$v^{\mathrm T}u=10$，
$$A^2=\begin{pmatrix}uv^{\mathrm T}&0\\0&10\end{pmatrix},\qquad A^3=10A .$$
故
$$A^{n}=\begin{cases}10^{\frac{n-1}{2}}A,&n\ \text{为奇数},\\[4pt] 10^{\frac n2-1}A^2,&n\ \text{为偶数},\end{cases}\qquad
A^2=\begin{pmatrix}3&2&1&0\\6&4&2&0\\9&6&3&0\\0&0&0&10\end{pmatrix}.$$

[26]
$F=xy-z\ln y+\mathrm e^{xz}-1$，在 $(0,1,1)$ 处
$$F'_x=y+z\mathrm e^{xz}=2\neq0,\qquad F'_y=x-\frac zy=-1\neq0,\qquad F'_z=-\ln y+x\mathrm e^{xz}=0 .$$
故可确定 $x=x(y,z)$ 与 $y=y(x,z)$，而不能（由隐函数定理）确定 $z=z(x,y)$．选 **C**．

[27]
$(E-2\alpha\alpha^{\mathrm T})\alpha=(1-2\cdot2)\alpha=-3\alpha$，对 $\xi\perp\alpha$ 有 $(E-2\alpha\alpha^{\mathrm T})\xi=\xi$，
故其特征值为 $-3,1,\cdots,1$，**可逆**且对称．于是
$$B^{\mathrm T}X=0\iff(E-2\alpha\alpha^{\mathrm T})A^{\mathrm T}X=0\iff A^{\mathrm T}X=0 .$$
选 **D**．

[28]
令 $u=t-x$，条件化为 $\int_0^{f(x)}g(u)du=x^2\ln(1+x)$．由反函数积分公式
$$\int_0^{f(x)}f^{-1}(u)du=xf(x)-\int_0^xf(t)dt=x^2\ln(1+x).$$
两边求导得 $xf'(x)=2x\ln(1+x)+\dfrac{x^2}{1+x}$，即 $f'(x)=2\ln(1+x)+\dfrac{x}{1+x}$，
$$f(x)=2(1+x)\ln(1+x)-x-\ln(1+x)\quad(f(0)=0),$$
故 $f(1)=4\ln2-1-\ln2=3\ln2-1$．

[29]
$$|(\alpha+2\beta)\times(3\alpha+\beta)|=|\alpha\times\beta-6\alpha\times\beta|=5|\alpha\times\beta|=5\sin\frac\pi6=\frac52 .$$

[30]
（Ⅰ）$|x|<1$ 时 $\frac{|x|^{n^2}}{2^n}\to0$ 且级数收敛；$|x|=1$ 时为 $\sum\frac{(\pm1)}{2^n}$ 收敛；$|x|>1$ 时通项趋于 $\infty$．
收敛域 $[-1,1]$．
（Ⅱ）$\frac{x^2}{3}<1$ 即 $|x|<\sqrt3$ 时收敛；$x=\pm\sqrt3$ 时通项 $\to\pm\sqrt3\neq0$，发散．收敛域 $(-\sqrt3,\sqrt3)$．

[31]
$$P\{X=Y\}=\sum_{k=1}^{\infty}p^2(1-p)^{2k-2}=\frac{p^2}{1-(1-p)^2}=\frac{p}{2-p}.$$
选 **D**．

[32]
（Ⅰ）依题意 $\displaystyle\int_0^x\sqrt{1+y'^2}\,dt=y'(x)$，求导得 $\sqrt{1+y'^2}=y''$．
令 $p=y'$：$\dfrac{dp}{\sqrt{1+p^2}}=dx$，由 $p(0)=0$ 得 $p=\sinh x$，再由 $y(0)=1$ 得
$$y=\cosh x=\frac{\mathrm e^x+\mathrm e^{-x}}{2}.$$
（Ⅱ）$\displaystyle s=\int_{\ln2}^{\ln3}\cosh x\,dx=\sinh(\ln3)-\sinh(\ln2)=\frac43-\frac34=\frac{7}{12}$．

[33]
取 $f(x)=\dfrac{\mathrm e^x}{x},\;g(x)=\dfrac1x$（在 $[a,b]$ 上 $x>0$），由柯西中值定理存在 $\xi\in(a,b)$ 使
$$\frac{f(b)-f(a)}{g(b)-g(a)}=\frac{\frac{\mathrm e^b}{b}-\frac{\mathrm e^a}{a}}{\frac1b-\frac1a}=\frac{a\mathrm e^b-b\mathrm e^a}{a-b},$$
而
$$\frac{f'(\xi)}{g'(\xi)}=\frac{\mathrm e^{\xi}(\xi-1)/\xi^2}{-1/\xi^2}=\mathrm e^{\xi}(1-\xi).$$
两者相等即得结论．

[34]
补上 $y=0$ 上的圆盘 $x^2+z^2\leqslant4$（外法向为 $-\mathbf j$，该面上三项积分均为 $0$），由高斯公式
$$\mathrm{div}=x^2+z^2,\qquad I=\iiint_V(x^2+z^2)dV=\int_0^{2\pi}\!\!\int_0^2r^2(4-r^2)r\,dr\,d\theta=\frac{32\pi}{3}.$$

[35]
$Y=\max\{X,\frac1X\}\geqslant1$．当 $y\geqslant1$ 时
$$F_Y(y)=P\Big\{\frac1y\leqslant X\leqslant y\Big\}=\mathrm e^{-\frac{\lambda}{y}}-\mathrm e^{-\lambda y},$$
$y<1$ 时 $F_Y(y)=0$．

[36]
（Ⅰ）$\dfrac{\partial f(x,x+y)}{\partial x}=f'_u+f'_v=(u+v)\mathrm e^{u-v}\Big|_{u=x,v=x+y}=(2x+y)\mathrm e^{-y}$．
（Ⅱ）固定 $w=v-u$，则 $\frac{d}{ds}f(s,s+w)=(2s+w)\mathrm e^{-w}$，积分并用 $f(0,w)=0$ 得
$$f(u,u+w)=\mathrm e^{-w}(u^2+wu)\Longrightarrow f(u,v)=uv\,\mathrm e^{u-v}.$$
驻点：$f'_u=v(1+u)\mathrm e^{u-v}=0,\;f'_v=u(1-v)\mathrm e^{u-v}=0\Rightarrow(0,0)$ 与 $(-1,1)$．
$(0,0)$ 处 $f\approx uv$ 不取极值；$(-1,1)$ 处 $A=C=\mathrm e^{-2}>0,\;B=0$，$AC-B^2>0$，
故取**极小值** $f(-1,1)=-\mathrm e^{-2}$．

[37]
两个累次积分合并后的区域为 $D=\{x\geqslant0,y\geqslant0,\;1\leqslant x+y\leqslant2\}$，关于 $y=x$ 对称，故
$$I=\iint_D\mathrm e^{(x+y)^2}(\sin^2x+\cos^2y)d\sigma=\frac12\iint_D\mathrm e^{(x+y)^2}\cdot2\,d\sigma=\iint_D\mathrm e^{(x+y)^2}d\sigma .$$
再用 $\iint_Dg(x+y)d\sigma=\int_1^2u\,g(u)du$：
$$I=\int_1^2u\mathrm e^{u^2}du=\frac{\mathrm e^4-\mathrm e}{2}.$$

[38]
$(A+E)C=O$ 且 $\mathrm r(C)=1$：$\lambda=-1$ 至少有 $1$ 个线性无关特征向量；
$B(A^{\mathrm T}-2E)=O$ 即 $(A-2E)B^{\mathrm T}=O$ 且 $\mathrm r(B^{\mathrm T})=2$：$\lambda=2$ 至少有 $2$ 个．
故特征值为 $-1,2,2$ 且可对角化，$A\sim\mathrm{diag}(-1,2,2)$．选 **D**．

[39]
记 $F(x)=\int_1^xt^2\sin t\,dt$，因 $t^2\sin t$ 为奇函数，$F(1)=F(-1)=0$，且 $F'(\pm1)\neq0$．
$x=1$：分子含因子 $x(x-1)$，$f\to\dfrac{2\mathrm e^{-1}}{\sin1}$，**可去间断点**；
$x=-1$：分子含 $|x+1|$，左右极限为 $\pm\dfrac{2\mathrm e}{\sin1}$，**跳跃间断点**；
$x=0$：$x\to0^-$ 时 $\mathrm e^{-1/x}\to+\infty$ 使 $f\to\infty$，为第二类间断点．
故第一类间断点共 $2$ 个．选 **C**．

[40]
注意 $f'(x)\sin y\,dx+f(x)\cos y\,dy=\mathrm d[f(x)\sin y]$，而在 $A(2,2\pi)$ 与 $O(0,0)$ 处 $\sin y=0$，故这部分积分为 $0$：
$$I=-\pi\int_Lx\,dy .$$
以 $x=1+R\cos t,\;y=\pi+R\sin t\;(R=\sqrt{1+\pi^2})$ 参数化上半圆周（$t$ 由 $t_0$ 到 $t_0+\pi$）：
$$\int_Lx\,dy=\int_{t_0}^{t_0+\pi}(1+R\cos t)R\cos t\,dt=-2\pi+\frac{\pi(1+\pi^2)}{2},$$
故 $I=-\pi\Big[\dfrac{\pi(1+\pi^2)}{2}-2\pi\Big]=\dfrac{\pi^2(3-\pi^2)}{2}$．

[41]
令 $u=y^2$，方程化为 $u'-\dfrac{u}{x+1}=-\dfrac{x}{x+1}$，积分因子 $\dfrac{1}{x+1}$：
$$\Big(\frac{u}{x+1}\Big)'=-\frac{x}{(x+1)^2}\Longrightarrow \frac{u}{x+1}=-\ln|x+1|-\frac{1}{x+1}+C ,$$
即通解
$$y^2=C(x+1)-(x+1)\ln|x+1|-1 .$$

[42]
（Ⅰ）坐标关系 $x=Py$ 中
$$P=\begin{pmatrix}1&0&0\\-1&1&0\\0&-1&1\end{pmatrix}$$
即为由基 $\alpha$ 到基 $\beta$ 的过渡矩阵（$(\beta_1,\beta_2,\beta_3)=(\alpha_1,\alpha_2,\alpha_3)P$）．
（Ⅱ）
$$\beta_1=\alpha_1-\alpha_2=(-1,-1,2)^{\mathrm T},\quad \beta_2=\alpha_2-\alpha_3=(-1,2,-1)^{\mathrm T},\quad \beta_3=\alpha_3=(3,1,2)^{\mathrm T}.$$

[43]
$X,Y$ 独立同服从 $U[0,3]$：$EX=\frac32,\;EX^2=3,\;EX^4=\frac{81}{5}$．
$$EU=2EX^2+2(EX)^2=\frac{21}{2},\qquad EV=2EX^2-2(EX)^2=\frac32,$$
$$E(UV)=E(X^2-Y^2)^2=2EX^4-2(EX^2)^2=\frac{72}{5},$$
$$\mathrm{Cov}(U,V)=\frac{72}{5}-\frac{21}{2}\cdot\frac32=-\frac{27}{20}.$$

[44]
当 $x\in[-3,-\frac52]$ 时 $-x-2\in[\frac12,1]$，由周期性与偶性
$$S(x)=f(x)=f(-x-2)=2-2(-x-2)=2x+6\qquad\Big(x\in\Big[-3,-\frac52\Big)\Big),$$
而 $x=-\frac52$ 是 $f$ 的跳跃点，$S\big(-\frac52\big)=\dfrac{1+\frac12}{2}=\dfrac34$．

[45]
$A=2E-J$（$J$ 为 $4$ 阶全 $1$ 矩阵），$J^2=4J$，故
$$A^2=4E-4J+J^2=4E .$$
于是
$$A^n=\begin{cases}2^nE,&n\ \text{为偶数},\\[2pt]2^{\,n-1}A,&n\ \text{为奇数}.\end{cases}$$

[46]
$BA^{\mathrm T}=O$ 且 $A\neq O$ 得 $|B|=a^2-a-6=0$，由 $a>0$ 得 $a=3$，此时 $\mathrm r(B)=2$．
$A$ 的各行都属于 $Bx=0$ 的解空间，该空间由 $(-11,6,1)^{\mathrm T}$ 张成，故 $\mathrm r(A)=1$，
$AX=0$ 即 $-11x_1+6x_2+x_3=0$．验证 $(1,2,-1)^{\mathrm T},(0,-1,6)^{\mathrm T}$ 均为其解且线性无关．选 **B**．

[47]
二次型矩阵为 $\begin{pmatrix}1&1&0\\1&k+2&0\\0&0&k\end{pmatrix}$，椭球面要求其正定：
$$1>0,\qquad k+1>0,\qquad k(k+1)>0\Longrightarrow k>0 .$$
选 **A**．

[48]
记 $\varphi(x)=\int_0^x(\mathrm e^{-t^2}+\sin t^2)dt$，则 $f(x,\varphi(x))\equiv0$，$\varphi(0)=0,\;\varphi'(0)=1$．
求导得 $f'_x+f'_y\varphi'=0$，在 $(0,0)$ 处 $1+f'_y=0$，$f'_y(0,0)=-1$．故
$$\mathrm dz\big|_{(0,0)}=\mathrm dx-\mathrm dy .$$

[49]
上侧时 $d\mathbf S=(-z'_x,-z'_y,1)dxdy=\big(-\frac xr,-\frac yr,1\big)dxdy$（$r=\sqrt{x^2+y^2}=z$），
$$I=\iint_{1\leqslant r\leqslant2}\Big[-x^2r-\frac{y^3}{r}+rx\Big]d\sigma
=\int_0^{2\pi}\!\!\int_1^2\big[-r^4\cos^2\theta-r^3\sin^3\theta+r^3\cos\theta\big]dr\,d\theta=-\frac{31\pi}{5}.$$

[50]
$P(A)=0.7$，$P(AB)=P(A)-P(A-B)=0.2$，$P(A\cup\overline B)=P(A)+P(\overline B)-P(A\overline B)=0.7+0.6-0.5=0.8$，
$$P(B\mid A\cup\overline B)=\frac{P(AB)}{P(A\cup\overline B)}=\frac{0.2}{0.8}=\frac14 .$$

[51]
$x\to+\infty$ 时 $\dfrac{\ln x}{x^a}\to0$（需 $a>0$），此时被积函数 $\sim\dfrac{\ln x}{x^a}$，
而 $\int_2^{+\infty}\frac{\ln x}{x^a}dx$ 收敛当且仅当 $a>1$；$a\leqslant0$ 时被积函数不趋于 $0$，发散．选 **C**．

[52]
由 $\dfrac{\partial}{\partial y}[-6yf]=\dfrac{\partial}{\partial x}[x^2f'-4xf]$ 得欧拉方程
$$x^2f''-2xf'+2f=0\Longrightarrow f=C_1x+C_2x^2 ,$$
由 $f(1)=1,f'(1)=2$ 得 $C_1=0,C_2=1$，即 $f(x)=x^2$．此时
$$\mathrm du=-6x^2y\,\mathrm dx-2x^3\mathrm dy\Longrightarrow u(x,y)=-2x^3y+C .$$

[53]
$P(B)=P(A)=\frac12$ 给出 $\sigma=\mu$，于是 $B=A$，且 $C=\{X>\mu+\sigma\}\subset A$．
因此只要 $A$ 发生就至少有两个事件发生，"至多有一个发生"即 $A$ 不发生：
$$P=P(\overline A)=\frac12 .$$

[54]
$f(x)=x^2\sum\limits_{n\geqslant1}a_nx^{n-1}$，由在 $[0,1]$ 上收敛知 $h(x)=\sum a_nx^{n-1}$ 在 $[0,1]$ 上有界，$|h|\leqslant M$．
故 $|f(\frac1n)|\leqslant\frac{M}{n^2}$，级数 $\sum(-1)^{n-1}f(\frac1n)$ **绝对收敛**．选 **C**．

[55]
$\sin(xy)^2\sim(xy)^2$，
$$\int_0^tdx\int_x^tx^2y^2dy=\int_0^tx^2\cdot\frac{t^3-x^3}{3}dx=\frac{t^6}{18},$$
故极限为 $\dfrac1{18}$．

[56]
（按 $x\to0$ 理解，原题"$x\to\infty$"存疑．）
$x\to0^+$：$\frac{\ln(1+\mathrm e^{2/x})}{\ln(1+\mathrm e^{1/x})}\to2$，$[x]=0$，$f\to2$；
$x\to0^-$：该比值 $\to0$，$[x]=-1$，$f\to-a$．
极限存在要求 $-a=2$，故 $a=-2,\;b=2$．
（若严格按 $x\to\infty$，则必须 $a=0$，此时 $b=1$．）

[57]
$$\alpha=P\Big\{\overline X>\mu_0+\frac{1.96}{\sqrt n}\ \Big|\ \mu=\mu_0\Big\}=P\{Z>1.96\}=1-\Phi(1.96).$$
选 **C**．

[58]
$\mathbf F=\dfrac{\mathbf r}{|\mathbf r|^3}$ 在原点外散度为零，而 $S$ 是包围原点的闭曲面，
挖去小球面并用高斯公式得
$$I=\oiint_{|\mathbf r|=\varepsilon}\frac{\mathbf r\cdot\mathbf n}{\varepsilon^3}dS=\frac{1}{\varepsilon^2}\cdot4\pi\varepsilon^2=4\pi .$$

[59]
$F(0)=0$，
$$F'_+(0)=\lim_{x\to0^+}f(x)\frac{\sin x}{x}=\lim_{x\to0^+}f(x),\qquad F'_-(0)=-\lim_{x\to0^-}f(x),$$
故可导 $\iff$ 两个单侧极限存在且 $\lim\limits_{x\to0^-}f(x)=-\lim\limits_{x\to0^+}f(x)$．选 **D**．

[60]
由 $x_1=\frac{y_1}{2},\;x_2=\frac{y_2}{3}$，雅可比行列式为 $\frac16$，故
$$f_2(y_1,y_2)=\frac16f_1\Big(\frac{y_1}{2},\frac{y_2}{3}\Big).$$
选 **D**．

[61]
由 $f(tx,ty)=t^2f(x,y)$（二次齐次）及欧拉公式 $xf'_x+yf'_y=2f$，在 $(1,-2)$ 处
$$4-2f'_y(1,-2)=2\cdot2=4\Longrightarrow f'_y(1,-2)=0 .$$
切平面：$z-2=4(x-1)+0\cdot(y+2)$，即 $4x-z-2=0$．

[62]
由 $A^3\alpha=3A\alpha-2A^2\alpha$ 得 $AP=PB$，其中
$$B=\begin{pmatrix}0&0&0\\1&0&3\\0&1&-2\end{pmatrix},$$
故 $A\sim B$，
$$|A+E|=|B+E|=\begin{vmatrix}1&0&0\\1&1&3\\0&1&-1\end{vmatrix}=-4 .$$

[63]
在 $x=b$ 处连续且可导：
$$a\sqrt b=\ln b,\qquad \frac{a}{2\sqrt b}=\frac1b\Longrightarrow a=\frac{2}{\sqrt b},$$
代入第一式得 $2=\ln b$，$b=\mathrm e^2$，$a=\dfrac2{\mathrm e}$．选 **A**．
