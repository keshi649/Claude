[1]
A 中 $C$ 可以不可逆，只能保证半正定；B 中负惯性指数为 $0$ 仍可能有零特征值；C 中 $P^{-1}AP=E$ 意味 $A=E$，过强．
D：$A$ 正定 $\Rightarrow A^*$ 的特征值 $\frac{|A|}{\lambda_i}>0$，$A^*$ 正定，与 $E$ 合同；反之若 $A^*$ 正定，设 $A$ 的特征值全为负，则 $n$ 为偶数时 $|A|>0$，$\frac{|A|}{\lambda_i}<0$ 矛盾，故 $A$ 正定．选 **D**．

[2]
两边取对数：$\frac12\ln(x^2+y^2)=\arctan\frac yx$，求导得
$$\frac{x+yy'}{x^2+y^2}=\frac{xy'-y}{x^2+y^2}\Longrightarrow y'=\frac{x+y}{x-y}.$$
再求导：
$$y''=\frac{(1+y')(x-y)-(x+y)(1-y')}{(x-y)^2}=\frac{2(x^2+y^2)}{(x-y)^3}.$$

[3]
$P(A\mid B)=P(A)$ 表明 $A,B$ 相互独立，从而 $P(AB)=P(A)P(B)>0$，$A,B$ 必相容，故"互不相容"不正确．选 **A**．

[4]
梯度场沿任意闭曲线的环流为零（$\mathbf{rot}\,\mathbf{grad}\equiv\mathbf 0$），故 $I=0$．

[5]
$L$ 上点为 $(1+3t,\,2+4t,\,-1+t)$，转轴为过 $(2,3)$ 平行 $z$ 轴的直线．由 $z=-1+t$ 得 $t=z+1$，
旋转时保持到轴的距离不变：
$$(x-2)^2+(y-3)^2=(3t-1)^2+(4t-1)^2=(3z+2)^2+(4z+3)^2 ,$$
即 $(x-2)^2+(y-3)^2=25z^2+36z+13$．

[6]
$EX_i=0$，$DX_i=E X_i^2=2\cdot\frac{(ia)^2}{2i^2}=a^2$，各 $X_i$ 独立且方差一致有界．
$$D\Big(\frac1n\sum X_i\Big)=\frac{1}{n^2}\cdot na^2=\frac{a^2}{n},$$
由切比雪夫不等式
$$P\Big\{\Big|\frac1n\sum X_i\Big|\geqslant\varepsilon\Big\}\leqslant\frac{a^2}{n\varepsilon^2}\to0\quad(n\to\infty).$$

[7]
令 $u=\tan y$，方程化为 $u'+\frac{x}{1+x^2}u=x$，积分因子 $\sqrt{1+x^2}$：
$$\big(\sqrt{1+x^2}\,u\big)'=x\sqrt{1+x^2}\Longrightarrow u=\frac{1+x^2}{3}+\frac{C}{\sqrt{1+x^2}} .$$
由 $y(0)=0$ 得 $u(0)=0$，$C=-\frac13$，故
$$\tan y=\frac{1+x^2}{3}-\frac{1}{3\sqrt{1+x^2}},\qquad y=\arctan\Big[\frac{1+x^2}{3}-\frac{1}{3\sqrt{1+x^2}}\Big].$$

[8]
由 $P^{-1}A^{-1}P=B^{-1}$ 取逆得 $P^{-1}AP=B$，故 ② 成立；由 $A\sim B$ 立得 ③、④ 成立；
又 $A$ 可逆时 $AB=A(BA)A^{-1}$，故 ① 成立．四个都对，选 **D**．

[9]
逐项求导不改变收敛半径，$\sum na_nx^n$ 的收敛半径仍为 $3$，故
$$\sum_{n=0}^{\infty}na_n(x+1)^{n+1}=(x+1)\sum na_n(x+1)^n$$
的收敛区间为 $|x+1|<3$，即 $(-4,2)$．

[10]
利用分块初等变换：
$$\begin{pmatrix}O&A\\B&E\end{pmatrix}\to\begin{pmatrix}-AB&O\\O&E\end{pmatrix},\quad
\begin{pmatrix}A&B\\O&E\end{pmatrix}\to\begin{pmatrix}A&O\\O&E\end{pmatrix},\quad
\begin{pmatrix}A&AB\\E&B\end{pmatrix}\to\begin{pmatrix}A&O\\E&O\end{pmatrix},$$
故 $r_1=n+\mathrm r(AB)$，$r_2=n+\mathrm r(A)$，$r_3=n$．又 $\mathrm r(AB)\leqslant\mathrm r(A)$，
所以 $r_2\geqslant r_1\geqslant r_3$．选 **A**．

[11]
$(X,Y)$ 的密度为 $\frac12$．当 $0\leqslant z\leqslant2$ 时
$$F_Z(z)=\frac12\Big[z\cdot1+\int_z^2\frac zx dx\Big]=\frac12\Big[z+z\ln\frac2z\Big],$$
$z<0$ 时为 $0$，$z>2$ 时为 $1$．求导得
$$f_Z(z)=\begin{cases}\frac12\ln\frac2z,&0<z<2,\\0,&\text{其他}.\end{cases}$$

[12]
$D$ 的面积为 $2\pi$，形心为 $(1,1)$，故 $\iint_D(x+y)d\sigma=4\pi$．由格林公式（顺时针取负号）
$$I_1=-\iint_D\frac{x+y}{4}d\sigma=-\pi,\qquad I_2=-\iint_D\frac{x-y}{4}d\sigma=0,\qquad I_3=+\iint_D\frac{x+y}{4}d\sigma=\pi .$$
故 $I_3>I_2>I_1$，选 **B**．

[13]
$$f'_x(0,0)=\lim_{x\to0}\frac{\arcsin|x|}{x}=\pm1\ \text{不存在},\qquad f'_y(0,0)=\lim_{y\to0}\frac{\arcsin y^2}{y}=0 .$$
选 **B**．

[14]
由 $|A|=0$ 及 $A_{11}\neq0$ 知 $\mathrm r(A)=n-1$，故 $\mathrm r(A^*)=1$，$A^*x=0$ 的解空间维数为 $n-1$．
又 $A^*A=|A|E=O$，说明 $A$ 的各列都是 $A^*x=0$ 的解，而 $\mathrm r(A)=n-1$ 恰等于解空间维数，
故解空间即 $A$ 的列空间．因 $A_{11}\neq0$，$A$ 的后 $n-1$ 个列 $\alpha_2,\cdots,\alpha_n$ 线性无关，可作基础解系：
$$x=k_2\alpha_2+k_3\alpha_3+\cdots+k_n\alpha_n .$$

[15]
$\big(1+\frac1k\big)^{k^2}=\mathrm e^{k^2\ln(1+\frac1k)}=\mathrm e^{k-\frac12+o(1)}$，故通项 $\sim\mathrm e^{-\frac12}\big(\frac{\mathrm e}{3}\big)^k$．
因 $\frac{\mathrm e}{3}<1$，级数 $\sum\limits_{k=1}^{\infty}\frac{1}{3^k}\big(1+\frac1k\big)^{k^2}$ 收敛，设和为 $S$，则
$$\lim_{n\to\infty}\frac1n\sum_{k=1}^{n}(\cdots)=\lim_{n\to\infty}\frac{S_n}{n}=0 .$$

[16]
由同分布连续性，$X_n$ 是 $n$ 个变量中最小者的概率为 $\frac1n$，故
$$P\{X_n>\min(X_1,\cdots,X_{n-1})\}=1-\frac1n=\frac{n-1}{n}.$$

[17]
（Ⅰ）切线在 $y$ 轴截距为 $y-xy'$，由题意 $\sqrt{x^2+y^2}=y-xy'$．令 $u=\frac yx$：
$$xu'=-\sqrt{1+u^2}\Longrightarrow u+\sqrt{1+u^2}=\frac Cx\Longrightarrow y+\sqrt{x^2+y^2}=C .$$
由过点 $\big(\frac12,0\big)$ 得 $C=\frac12$，化简得 $L:\;y=\frac14-x^2$．
（Ⅱ）设切点为 $\big(a,\frac14-a^2\big)\,(0<a<\frac12)$，切线 $y=\frac14+a^2-2ax$，与两轴围成三角形面积
$$\Delta(a)=\frac{(a^2+\frac14)^2}{4a},\qquad \Delta'(a)=\frac{(a^2+\frac14)(3a^2-\frac14)}{4a^2},$$
故 $a=\frac{\sqrt3}{6}$ 时最小，$\Delta=\frac{\sqrt3}{18}$．又曲线与两轴围成的面积为 $\int_0^{1/2}(\frac14-x^2)dx=\frac{1}{12}$（与 $a$ 无关），
所求最小面积为 $\dfrac{\sqrt3}{18}-\dfrac1{12}$，对应切线
$$y=\frac13-\frac{\sqrt3}{3}x .$$

[18]
$x\to0^+$：$\frac{2+\mathrm e^{1/x}}{1+\mathrm e^{2/x}}\to0$，$\frac{\sin x}{|x|}\to1$，故 $f(0^+)=1$；
$x\to0^-$：$\frac{2+0}{1+0}=2$，$\frac{\sin x}{|x|}\to-1$，故 $f(0^-)=1$．
左右极限相等而 $f$ 在 $0$ 无定义，为**可去间断点**．选 **A**．

[19]
（Ⅰ）$A$ 的特征值为 $2,-1,-1$，$|A|=2$；由 $A^*\alpha=\alpha$ 及 $A^*=2A^{-1}$ 得 $A\alpha=2\alpha$，
即 $\alpha=(1,1,-1)^{\mathrm T}$ 是 $\lambda=2$ 的特征向量．取
$$Q=\begin{pmatrix}\frac{1}{\sqrt3}&\frac{1}{\sqrt2}&\frac{1}{\sqrt6}\\[2pt]\frac{1}{\sqrt3}&-\frac{1}{\sqrt2}&\frac{1}{\sqrt6}\\[2pt]-\frac{1}{\sqrt3}&0&\frac{2}{\sqrt6}\end{pmatrix},\qquad Q^{\mathrm T}AQ=\mathrm{diag}(2,-1,-1),$$
$$A=3\cdot\frac{\alpha\alpha^{\mathrm T}}{3}-E=\alpha\alpha^{\mathrm T}-E=\begin{pmatrix}0&1&-1\\1&0&-1\\-1&-1&0\end{pmatrix}.$$
（Ⅱ）$A+2E$ 的特征值为 $4,1,1$，正定平方根为
$$B=\frac{\alpha\alpha^{\mathrm T}}{3}+E=\frac13\begin{pmatrix}4&1&-1\\1&4&-1\\-1&-1&4\end{pmatrix}.$$

[20]
$f$ 为奇函数时 $\int_0^xf(t)dt$ 为偶函数，任一原函数 $F(x)=\int_0^xf+C$ 仍为偶函数，A 正确．
B 中加常数后未必是奇函数；C 取 $f\equiv1$；D 取 $f(x)=x$（$F=\frac{x^2}{2}$ 非单调）均为反例．选 **A**．

[21]
三直线恰交于一点 $\iff$ 线性方程组 $\begin{pmatrix}a_i&b_i\end{pmatrix}\binom xy=-c_i$ 有唯一解
$\iff \mathrm r(\alpha_1,\alpha_2)=\mathrm r(\alpha_1,\alpha_2,\alpha_3)=2$．选 **D**．

[22]
极坐标：$0\leqslant\theta\leqslant\frac\pi4$，$2\cos\theta\leqslant r\leqslant\frac{2}{\cos\theta}$，
$$I=\int_0^{\frac\pi4}\!\!\int_{2\cos\theta}^{\frac{2}{\cos\theta}}dr\,d\theta=2\int_0^{\frac\pi4}(\sec\theta-\cos\theta)d\theta
=2\ln(1+\sqrt2)-\sqrt2 .$$

[23]
$S$ 是球心 $(1,0,0)$、半径 $1$ 的球面，其上 $\rho=x^2+y^2+z^2=2x$，
$$m=\oiint_S2x\,dS=2\bar x\cdot 4\pi=2\cdot1\cdot4\pi=8\pi .$$

[24]
$P\{X=k\}=\big(\frac14\big)^{k-1}\cdot\frac34$，
$$\sum_{n=1}^{\infty}P\{X=2n\}=\frac34\sum_{n=1}^{\infty}\Big(\frac14\Big)^{2n-1}=\frac34\cdot\frac{\frac14}{1-\frac1{16}}=\frac15 .$$

[25]
$F=x^2+y^2-1-z$，$\nabla F\big|_P=(4,2,-1)$．
切平面：$4(x-2)+2(y-1)-(z-4)=0$，即 $4x+2y-z-6=0$；
法线：$\dfrac{x-2}{4}=\dfrac{y-1}{2}=\dfrac{z-4}{-1}$．

[26]
以 $2$ 为周期（$l=1$），在 $[1,3]$ 上计算：
$$\frac{a_0}{2}=\frac12\int_1^3f(x)dx=\frac34,\qquad
a_n=\int_1^3f\cos n\pi x\,dx=\frac{1-(-1)^n}{n^2\pi^2},\qquad
b_n=\int_1^3f\sin n\pi x\,dx=\frac{(-1)^n}{n\pi}.$$
故
$$f(x)=\frac34+\sum_{n=1}^{\infty}\Big[\frac{1-(-1)^n}{n^2\pi^2}\cos n\pi x+\frac{(-1)^n}{n\pi}\sin n\pi x\Big],$$
在 $f$ 的连续点处成立；在 $x=1,3$（及其同余点）处级数收敛到 $\frac{1+0}{2}=\frac12$．

[27]
$|A|=|E+\alpha\beta^{\mathrm T}|=1+\beta^{\mathrm T}\alpha=1+2=3\neq0$，故 $A$ 可逆．
设 $A^{-1}=E+k\alpha\beta^{\mathrm T}$，由
$$(E+\alpha\beta^{\mathrm T})(E+k\alpha\beta^{\mathrm T})=E+(1+k+2k)\alpha\beta^{\mathrm T}=E$$
得 $k=-\frac13$，即 $A^{-1}=E-\dfrac13\alpha\beta^{\mathrm T}$．

[28]
（原题应附有条件 $|f''(x)|\leqslant1$，否则结论不成立：取 $f(x)=c+M\sin4\pi x$ 满足全部已知条件而 $|f'(0)|+|f'(1)|=8\pi|M|$ 可任意大．下面在 $|f''|\leqslant1$ 下证明．）
由积分中值定理，存在 $\xi\in\big[\frac12,1\big]$ 使 $2\int_{\frac12}^1f\,dx=f(\xi)$，故 $f(0)=f(\xi)=f(1)$．
对 $[0,\xi]$、$[\xi,1]$ 分别用罗尔定理，得 $c\in(0,\xi)$、$d\in(\xi,1)$ 使 $f'(c)=f'(d)=0$．于是
$$|f'(0)|=\Big|\int_0^cf''dx\Big|\leqslant c,\qquad |f'(1)|=\Big|\int_d^1f''dx\Big|\leqslant1-d ,$$
相加得 $|f'(0)|+|f'(1)|\leqslant c+1-d<1$（$\xi=1$ 时直接对 $[0,1]$ 用罗尔定理同理）．

[29]
齐次解 $(C_1+C_2x)\mathrm e^{-x}$；设特解 $y^*=(ax+b)\mathrm e^x$，代入得 $4ax+4a+4b=x$，$a=\frac14,\;b=-\frac14$．
$$y=(C_1+C_2x)\mathrm e^{-x}+\frac{x-1}{4}\mathrm e^{x};\qquad y(0)=0\Rightarrow C_1=\frac14,\quad y'(0)=0\Rightarrow C_2=\frac14 .$$
故 $y=\dfrac{1+x}{4}\mathrm e^{-x}+\dfrac{x-1}{4}\mathrm e^{x}$．

[30]
（Ⅰ）$A^{\mathrm T}=A$ 为实对称矩阵，必可正交相似对角化．具体地
$$A(\alpha+\beta)=\alpha+\beta,\qquad A(\alpha-\beta)=-(\alpha-\beta),\qquad A\gamma=0\;(\gamma\perp\alpha,\beta),$$
特征值为 $1,-1,0$，三者互异，故 $A$ 相似于对角矩阵．
（Ⅱ）由上式知 $P=(\gamma,\,2(\alpha+\beta),\,\beta-\alpha)$ 的三列分别是特征值 $0,1,-1$ 的特征向量，故
$$P^{-1}AP=\mathrm{diag}(0,1,-1).$$

[31]
由 $\lim\limits_{x\to0}\frac{f(x)}{1-\cos x}=2$ 知在 $0$ 的去心邻域内 $f(x)>0=f(0)$，故 $f$ 在 $x=0$ 取极小值；
又 $\frac{f(x)}{x}=\frac{f(x)}{1-\cos x}\cdot\frac{1-\cos x}{x}\to2\cdot0=0$，故 $f'(0)=0$ 存在．选 **D**．

[32]
$$V=\iint_{r\leqslant h}\Big(h-\frac{r^2}{h}\Big)d\sigma=\frac{\pi h^3}{2},\qquad
S=\iint_{r\leqslant h}\sqrt{1+\frac{4r^2}{h^2}}\,d\sigma=\frac{\pi h^2}{6}\big(5\sqrt5-1\big).$$
由 $\frac{dV}{dt}=-aS$ 得
$$\frac{3\pi h^2}{2}\frac{dh}{dt}=-a\frac{\pi h^2}{6}(5\sqrt5-1)\Longrightarrow \frac{dh}{dt}=-\frac{a(5\sqrt5-1)}{9},$$
故 $h(t)=h_0-\frac{a(5\sqrt5-1)}{9}t$，全部融化所需时间
$$T=\frac{9h_0}{a(5\sqrt5-1)}.$$

[33]
（Ⅰ）$\iint_{\mathbf R^2}(1+xy)\mathrm e^{-\frac{x^2+y^2}{2}}dxdy=2\pi+0=2\pi$，故 $k=2\pi$．
边缘密度 $f_X(x)=\frac{1}{\sqrt{2\pi}}\mathrm e^{-x^2/2}$，同理 $f_Y(y)=\frac{1}{\sqrt{2\pi}}\mathrm e^{-y^2/2}$，
而 $f(x,y)\neq f_X(x)f_Y(y)$，故 $X$ 与 $Y$ **不独立**（但都服从 $N(0,1)$）．
（Ⅱ）由卷积公式
$$f_U(u)=\int_{-\pi}^{\pi}\frac{1}{2\pi}\varphi(u-z)dz=\frac{\Phi(u+\pi)-\Phi(u-\pi)}{2\pi}.$$

[34]
$$\cos x-\mathrm e^{\frac{x^2}{2}}=-x^2+o(x^2),\quad \sin x^2\sim x^2,\quad \frac{x^2}{2}+1-\sqrt{1+x^2}=\frac{x^4}{8}+o(x^4),$$
故极限 $=\dfrac{-x^4}{x^4/8}=-8$．

[35]
（Ⅱ）的解为 $k_1\alpha_1+k_2\alpha_2=(-k_1,\,2k_1-k_2,\,2k_1-k_2,\,k_1)^{\mathrm T}$，代入（Ⅰ）：
$$x_1+x_2=k_1-k_2=0,\qquad x_2-x_4=k_1-k_2=0 ,$$
故 $k_1=k_2=k$，非零公共解为
$$k(\alpha_1+\alpha_2)=k(-1,1,1,1)^{\mathrm T},\qquad k\neq0 .$$

[36]
$$f(x)=\int_0^x\sum_{n=0}^{\infty}\frac{(-1)^nt^{2n}}{n!}dt=\sum_{n=0}^{\infty}\frac{(-1)^n x^{2n+1}}{n!(2n+1)},\qquad -\infty<x<+\infty .$$

[37]
对 $g(x+y)$ 型函数，$\iint_Dg(x+y)d\sigma=\int_0^tu\,g(u)du$；又由 $u=x+y,\;v=x-y$ 知 $\iint_D(x-y)^3d\sigma=0$．
故条件化为
$$\int_0^tuf''(u)du=\int_0^tuf(u)du\quad(\forall t),$$
求导得 $tf''(t)=tf(t)$，即 $f''=f$．于是 $f(x)=C_1\mathrm e^x+C_2\mathrm e^{-x}$，
由 $f(0)=1,\;f'(0)=1$ 得 $C_1=1,C_2=0$，故 $f(x)=\mathrm e^{x}$．

[38]
在 $L$ 上分母恒为 $1$，故 $I=\oint_L(-y\,dx+x\,dy)=2S$，$S$ 为 $L$ 所围面积．
令 $u=\ln x,\;v=\ln y$，则 $L$ 变为 $|u|+|v|=1$，$dxdy=\mathrm e^{u+v}dudv$，
$$S=\iint_{|u|+|v|\leqslant1}\mathrm e^{u+v}dudv=\frac12\int_{-1}^1\!\!\int_{-1}^{1}\mathrm e^{s}\,dd\,ds=\mathrm e-\frac1{\mathrm e},$$
（其中 $s=u+v,\;d=u-v$）．故 $I=2\Big(\mathrm e-\dfrac{1}{\mathrm e}\Big)$．

[39]
$F$ 是两个正态分布函数的混合，
$$EX=0.3\times4+0.7\times(-1)=0.5 .$$

[40]
两曲面交于 $r=1,\;z=0$．用柱面坐标，$r-1\leqslant z\leqslant\sqrt{1-r^2}\,(0\leqslant r\leqslant1)$：
$$I=2\pi\int_0^1\frac{r}{3}\Big[(1-r^2)^{\frac32}-(r-1)^3\Big]dr=\frac{2\pi}{3}\Big(\frac15+\frac1{20}\Big)=\frac{\pi}{6}.$$

[41]
两曲面法向量 $\mathbf n_1=(6,2,0)$，$\mathbf n_2=(6,0,2)$，切向量 $\mathbf n_1\times\mathbf n_2=(4,-12,-12)\parallel(1,-3,-3)$．
切线：$\dfrac{x-3}{1}=\dfrac{y-1}{-3}=\dfrac{z-1}{-3}$；法平面：$(x-3)-3(y-1)-3(z-1)=0$，即 $x-3y-3z+3=0$．

[42]
令 $u=x^2-t^2$，则 $F(x)=\frac12\int_0^{x^2}f(u)du$，于是
$$\lim_{x\to0}\frac{F(x)}{x^4}=\frac12\lim_{s\to0^+}\frac{\int_0^sf(u)du}{s^2}=\frac12\cdot\lim_{s\to0^+}\frac{f(s)}{2s}=\frac{f'(0)}{4}=\frac14 .$$

[43]
由 $AB=B^{-1}A^{-1}=(AB)^{-1}$ 得 $(AB)^2=E$，同理 $(BA)^2=E$，即 $(E+BA)(E-BA)=O$．
故 $\mathrm r(E+BA)+\mathrm r(E-BA)\leqslant n$；又
$$\mathrm r(E+BA)+\mathrm r(E-BA)\geqslant\mathrm r\big[(E+BA)+(E-BA)\big]=\mathrm r(2E)=n .$$
故和为 $n$．

[44]
$y=\frac49x^2$，$\frac{dy}{dt}=\frac89x\frac{dx}{dt}\Big|_{x=3}=\frac83\cdot30=80$（cm/s）．
$S=\sqrt{x^2+y^2}=5$，
$$\frac{dS}{dt}=\frac{x\frac{dx}{dt}+y\frac{dy}{dt}}{S}=\frac{3\cdot30+4\cdot80}{5}=82\ \mathrm{cm/s}.$$

[45]
隐函数 $y'=-\frac{F'_x}{F'_y}$，故 $y'(x_0)=0$；再求导并代入 $y'(x_0)=0$ 得
$$y''(x_0)=-\frac{F''_{xx}(x_0,y_0)}{F'_y(x_0,y_0)}>0 ,$$
故 $y(x)$ 在 $x_0$ 处取得极小值．选 **A**．

[46]
球面在柱体内的部分（上下两块）：
$$S_1=2\int_{-\frac\pi2}^{\frac\pi2}\!\!\int_0^{R\cos\theta}\frac{R}{\sqrt{R^2-r^2}}r\,dr\,d\theta=2R^2\int_{-\frac\pi2}^{\frac\pi2}(1-|\sin\theta|)d\theta=2R^2(\pi-2).$$
柱面在球内部分：取 $x=\frac R2(1+\cos\varphi),\;y=\frac R2\sin\varphi$，则 $|z|\leqslant R\big|\sin\frac\varphi2\big|$，$ds=\frac R2d\varphi$，
$$S_2=\int_0^{2\pi}2R\Big|\sin\frac\varphi2\Big|\cdot\frac R2\,d\varphi=4R^2 .$$
故 $\dfrac{S_1}{S_2}=\dfrac{\pi-2}{2}$．

[47]
$A=3E-2J$（$J$ 为全 $1$ 矩阵），特征值为 $3-2\cdot3=-3$ 与 $3$（二重），
故 $f=3y_1^2+3y_2^2-3y_3^2$，$f=1$ 表示单叶双曲面．选 **C**．

[48]
$\overline X-\overline Y\sim N\big(0,\frac{2\sigma^2}{n}\big)$，
$$P\{|\overline X-\overline Y|>\sigma\}=P\Big\{|Z|>\sqrt{\frac n2}\Big\}$$
与 $\sigma$ 无关．选 **C**．

[49]
设平面束 $3x-2y+2+\lambda(x-2y-z+6)=0$，即 $(3+\lambda)x-(2+2\lambda)y-\lambda z+(2+6\lambda)=0$．
由点 $P(1,2,1)$ 到平面距离为 $1$：
$$\frac{|1+2\lambda|}{\sqrt{6\lambda^2+14\lambda+13}}=1\Longrightarrow \lambda^2+5\lambda+6=0\Longrightarrow\lambda=-2\ \text{或}\ -3 .$$
故 $\pi:\;x+2y+2z-10=0$ 或 $4y+3z-16=0$．

[50]
$y>0$ 时 $F_Y(y)=P\{X\geqslant\mathrm e^{-y/2}\}=1-\mathrm e^{-y/2}$，故
$$f_Y(y)=\begin{cases}\frac12\mathrm e^{-y/2},&y>0,\\0,&y\leqslant0,\end{cases}$$
即 $Y$ 服从参数为 $\frac12$ 的指数分布．

[51]
$$f(x)=\lim_{n\to\infty}\frac{x^{2n+2}-1}{x^{2n}+1}=\begin{cases}x^2,&|x|>1,\\ -1,&0<|x|<1,\\ 0,&x=\pm1 .\end{cases}$$
（$x=0$ 时原式无意义．）故 $f$ 在 $x=\pm1$ 处左右极限为 $-1$ 与 $1$，是**跳跃间断点**；
$x=0$ 处极限为 $-1$，是**可去间断点**；其余各点连续．

[52]
对 $(\alpha_1,\alpha_2,\alpha_3,\alpha_4\mid\alpha)$ 作行变换得
$$\begin{pmatrix}1&3&4&2&0\\0&a+1&2&1&1\\0&0&0&2a-1&1\\0&0&0&0&b-1\end{pmatrix}.$$
（Ⅰ）当 $a\neq\frac12$ 时 $\mathrm r(\alpha_1,\alpha_2,\alpha_3,\alpha_4)=3$，极大无关组可取 $\alpha_1,\alpha_2,\alpha_4$（当 $a=-1$ 时取 $\alpha_1,\alpha_3,\alpha_4$）；
当 $a=\frac12$ 时秩为 $2$，极大无关组为 $\alpha_1,\alpha_2$．
（Ⅱ）$\alpha$ 不能被线性表示 $\iff$ 增广矩阵秩更大：
当 $a=\frac12$ 时（第三行成为 $0=1$）对任意 $b$ 都不能表示；当 $a\neq\frac12$ 时须 $b\neq1$．

[53]
（Ⅰ）$\frac{1}{x^2-3x+2}=\frac{1}{1-x}-\frac{1}{2}\cdot\frac{1}{1-\frac x2}=\sum\limits_{n=0}^{\infty}\Big(1-\frac{1}{2^{n+1}}\Big)x^n,\;|x|<1$．
（Ⅱ）$\ln(1-x-2x^2)=\ln(1-2x)+\ln(1+x)=\sum\limits_{n=1}^{\infty}\frac{(-1)^{n-1}-2^n}{n}x^n$，收敛域 $\big[-\frac12,\frac12\big)$．
（Ⅲ）$\ln\big(x+\sqrt{1+x^2}\big)=\sum\limits_{n=0}^{\infty}\frac{(-1)^n(2n)!}{4^n(n!)^2(2n+1)}x^{2n+1}$，收敛域 $[-1,1]$．
（Ⅳ）$x\arctan x-\frac12\ln(1+x^2)=\sum\limits_{n=0}^{\infty}\frac{(-1)^n}{(2n+1)(2n+2)}x^{2n+2}$，收敛域 $[-1,1]$．

[54]
分离变量：$\dfrac{dx}{2x-1}=-\dfrac{y\,dy}{1+y^2}$，积分得 $\frac12\ln|2x-1|=-\frac12\ln(1+y^2)+C$，即
$$(2x-1)(1+y^2)=C .$$

[55]
（Ⅰ）$A^2=A$ 且实对称，特征值只能为 $0,1$，由 $\mathrm r(A)=r$ 知 $1$ 为 $r$ 重、$0$ 为 $n-r$ 重，
$$|3E-A|=2^r\cdot3^{\,n-r}.$$
（Ⅱ）一般矩阵满足 $A^2=A$ 时最小多项式 $\lambda^2-\lambda$ 无重根，$A$ 仍可对角化，结论相同：$|3E-A|=2^r3^{\,n-r}$．

[56]
以第二个方程为主元作消元：
$$\begin{pmatrix}1&0&1&-1&-3\\0&-1&2&-1&2\\0&1&-2&3&10\\0&0&0&4&24\end{pmatrix}\Rightarrow x_4=6,\;x_2=2x_3-8,\;x_1=3-x_3 .$$
故通解
$$x=(3,-8,0,6)^{\mathrm T}+t(-1,2,1,0)^{\mathrm T},\qquad t\in\mathbf R .$$

[57]
增加最快的方向即梯度方向
$$\nabla f(1,-2)=(1,-1),\qquad \text{单位方向}\ \Big(\frac{\sqrt2}{2},-\frac{\sqrt2}{2}\Big).$$

[58]
由对称性 $\iint_Dx^2d\sigma=\iint_Dy^2d\sigma=\frac12\iint_Dr^2d\sigma=\frac{\pi}{4}$，故
$$I=\Big(\frac14+\frac19\Big)\cdot\frac\pi4=\frac{13\pi}{144}.$$

[59]
$\overline X\sim N\big(\mu,\frac{8}{36}\big)$，$\sigma_{\overline X}=\frac{\sqrt2}{3}$，
$$P\{|\overline X-\mu|<1\}=2\Phi\Big(\frac{1}{\sqrt2/3}\Big)-1=2\Phi\Big(\frac{3\sqrt2}{2}\Big)-1\approx0.966 .$$

[60]
补上从 $C(1,0)$ 到 $A(1,1)$ 的直线段 $\overline{CA}$，所得闭曲线为逆时针且内部含原点，故
$$\oint=2\pi .$$
而在 $\overline{CA}$ 上 $x=1,\;dx=0$：$\int_{\overline{CA}}=\int_0^1\frac{dy}{1+y^2}=\frac\pi4$．
故 $I=2\pi-\dfrac\pi4=\dfrac{7\pi}{4}$．

[61]
由切比雪夫不等式的形式知 $EX=\frac{b-1}{2}=1$，故 $b=3$，此时 $DX=\frac{(b+1)^2}{12}=\frac43$．
由 $1-\frac{DX}{\varepsilon^2}=\frac23$ 得 $\varepsilon^2=4$，即 $\varepsilon=2$．

[62]
（Ⅰ）$y'=\sqrt{\sin\frac xn}$，
$$S_n=\int_0^{n\pi}\sqrt{1+\sin\frac xn}\,dx=n\int_0^{\pi}\Big(\sin\frac u2+\cos\frac u2\Big)du=4n .$$
（Ⅱ）$\sum\dfrac{x^n}{S_nS_{n+1}}=\dfrac{1}{16}\sum\dfrac{x^n}{n(n+1)}$，收敛域 $[-1,1]$．由 $\frac{1}{n(n+1)}=\frac1n-\frac1{n+1}$：
$$S(x)=\frac{1}{16}\Big[1+\frac{1-x}{x}\ln(1-x)\Big]\;(x\neq0,\,x\neq1),\qquad S(0)=0,\quad S(1)=\frac{1}{16}.$$

[63]
两边求导：$f'(x)=-\sin x-\int_0^xf(t)dt$，再求导得 $f''+f=-\cos x$，且 $f(0)=1,\;f'(0)=0$．
齐次解 $C_1\cos x+C_2\sin x$，共振特解 $-\frac x2\sin x$，代入初值得 $C_1=1,C_2=0$：
$$f(x)=\cos x-\frac x2\sin x .$$

[64]
$x\to+\infty$ 时 $\sqrt{ax^2-x+3}\sim\sqrt a\,x$，由极限存在得 $\sqrt a=2$，$a=4$；再由
$$\sqrt{4x^2-x+3}-2x=\frac{-x+3}{\sqrt{4x^2-x+3}+2x}\to-\frac14=b .$$
故斜渐近线为 $y=2x-\dfrac14$．

[65]
$$E(X+Y-2Z)=1+1+2=4 ;$$
$$D(X+Y+Z)=3+2\big[\mathrm{Cov}(X,Y)+\mathrm{Cov}(X,Z)+\mathrm{Cov}(Y,Z)\big]=3+2\Big(0+\frac12-\frac12\Big)=3 .$$

[66]
$|A|=-2$，$A^*=|A|A^{-1}=\mathrm{diag}(-2,1,-2)$．由 $(A^*-2E)BA=-8E$ 得
$$BA=-8\,\mathrm{diag}(-4,-1,-4)^{-1}=\mathrm{diag}(2,8,2),$$
$$B=\mathrm{diag}(2,8,2)A^{-1}=\mathrm{diag}(2,8,2)\,\mathrm{diag}\Big(1,-\frac12,1\Big)=\mathrm{diag}(2,-4,2).$$

[67]
由 $f$ 为偶函数，
$$F(-x_0)=\int_{-\infty}^{-x_0}f=\int_{x_0}^{+\infty}f=a-F(x_0)=a-\Big[\frac a2+\int_0^{x_0}f\Big]=\frac a2-\int_0^{x_0}f(x)dx .$$
选 **C**．

[68]
（Ⅰ）$-f'_x=x^2-y,\;-f'_y=1-x$，即 $f'_x=y-x^2,\;f'_y=x-1$，积分得
$$f(x,y)=xy-\frac{x^3}{3}-y+C ,$$
由 $f(1,1)=-\frac13$ 得 $C=0$，故 $f(x,y)=xy-\dfrac{x^3}{3}-y$．
（Ⅱ）内部驻点 $(1,1)$，$f=-\frac13$；边界 $y=0$ 时 $f=-\frac{x^3}{3}\leqslant0$；$x=0$ 时 $f=-y\leqslant0$；
边界 $x+y=7$ 上 $f=-\frac{x^3}{3}-x^2+8x-7$，$f'=-x^2-2x+8=0\Rightarrow x=2$，$f(2,5)=\frac73$．
故最大值为 $\dfrac73$（在 $(2,5)$ 处取得）．

[69]
（Ⅰ）$P\{Z\leqslant-\frac12\mid X=0\}=P\{Y\geqslant\frac12\}=\mathrm e^{-\frac12}$．
（Ⅱ）$F_Z(z)=0.4P\{Y\geqslant-z\}+0.6P\{Y\geqslant1-z\}$，即
$$F_Z(z)=\begin{cases}(0.4+0.6\mathrm e^{-1})\mathrm e^{z},&z<0,\\[2pt]0.4+0.6\mathrm e^{z-1},&0\leqslant z<1,\\[2pt]1,&z\geqslant1 .\end{cases}$$

[70]
上侧时 $dydz=(-z'_x)dxdy=2x\,dxdy$，$dzdx=(-z'_y)dxdy=2y\,dxdy$，故
$$I=\iint_D\big[2x^2z+2xy^2+yz\big]dxdy,\qquad D:\;x^2+y^2\leqslant1,\;x,y\geqslant0,\;z=2-r^2 .$$
用极坐标分别算得 $\frac\pi6$、$\frac2{15}$、$\frac7{15}$，故
$$I=\frac{\pi}{6}+\frac{2}{15}+\frac{7}{15}=\frac{\pi}{6}+\frac35 .$$

[71]
由 $\alpha_1+2\alpha_2-\alpha_3=0$ 知 $A\xi=0$，$\xi=(1,2,-1)^{\mathrm T}$，即 $0$ 是特征值；又 $1$ 是二重特征值，故特征值为 $1,1,0$．
（Ⅰ）$\lambda=1$ 的特征子空间为 $\xi^{\perp}$，取其中正交基 $(2,-1,0)^{\mathrm T},(1,2,5)^{\mathrm T}$，单位化后与 $\frac{\xi}{\sqrt6}$ 合成正交矩阵
$$Q=\Big(\frac{(1,2,-1)^{\mathrm T}}{\sqrt6},\ \frac{(2,-1,0)^{\mathrm T}}{\sqrt5},\ \frac{(1,2,5)^{\mathrm T}}{\sqrt{30}}\Big),$$
则 $X=QY$ 把 $f$ 化为标准形 $y_2^2+y_3^2$．
（Ⅱ）$A^*$ 的特征值为 $1\cdot1=1$（对应 $\xi$）与 $0,0$（对应 $\xi^\perp$），故 $A^*X=0$ 的解空间为 $\xi^{\perp}$：
$$X=k_1(-2,1,0)^{\mathrm T}+k_2(1,0,1)^{\mathrm T}.$$

[72]
令 $t=x-2$：
$$f=(t+2)\mathrm e^{t+2}=\mathrm e^2\sum_{n=0}^{\infty}\frac{n+2}{n!}t^n=\sum_{n=0}^{\infty}\frac{\mathrm e^2(n+2)}{n!}(x-2)^n\quad(-\infty<x<+\infty),$$
故 $f^{(n)}(2)=n!\cdot\dfrac{\mathrm e^2(n+2)}{n!}=(n+2)\mathrm e^2$．

[73]
令 $u=\frac yx$：$xu'=-\dfrac{1+u^2}{1+u}$，分离变量得
$$\frac12\ln(1+u^2)+\arctan u=-\ln|x|+C\Longrightarrow \frac12\ln(x^2+y^2)+\arctan\frac yx=C .$$
由 $y(1)=0$ 得 $C=0$，故特解为
$$\ln(x^2+y^2)+2\arctan\frac yx=0,\qquad\text{即}\qquad \sqrt{x^2+y^2}=\mathrm e^{-\arctan\frac yx}.$$

[74]
$P(AB)=0.12$，$P(AC)=0$，$P(BC)=P(B\mid C)P(C)=0.08$．
（Ⅰ）$P(A\cup B)=0.4+0.3-0.12=0.58$．
（Ⅱ）$P(C\mid A\cup B)=\dfrac{P(AC)+P(BC)-P(ABC)}{0.58}=\dfrac{0.08}{0.58}=\dfrac{4}{29}$．
（Ⅲ）由 $A\subset\overline C$ 得 $P(AB\overline C)=P(AB)=0.12$，故 $P(AB\mid\overline C)=\dfrac{0.12}{0.6}=0.2$．

[75]
① 反例 $x_n=n$（$\arctan x_n\to\frac\pi2$ 收敛而 $x_n$ 发散）；② 反例同上（单调但不收敛）．
③ $\arcsin$ 连续，收敛数列的连续像收敛；④ 有界单调必收敛，再取连续像仍收敛．
故 ③④ 正确，选 **B**．

[76]
（Ⅰ）$|A|=(a-1)^2(a+1)=0\Rightarrow a=1$ 或 $-1$．条件"$A^{\mathrm T}X=0$ 的解都是 $\beta^{\mathrm T}X=0$ 的解"等价于 $\beta$ 可由 $A$ 的列向量线性表示．
$a=1$ 时 $A$ 的列全为 $(1,0,1)^{\mathrm T}$，而 $\beta$ 的第二个分量为 $1\neq0$，不可能；
$a=-1$ 时解 $x_1(-1,0,1)^{\mathrm T}+x_2(1,-2,1)^{\mathrm T}=\beta$ 得 $x_2=-\frac12,\;x_1=\frac32,\;b=-2$．
故 $a=-1,\;b=-2$．
（Ⅱ）此时 $|\lambda E-A|=\lambda(\lambda+2)^2$，$\lambda=0$ 的特征向量 $(1,0,1)^{\mathrm T}$；$\lambda=-2$ 时 $A+2E$ 秩为 $1$，
特征向量 $(1,-1,0)^{\mathrm T},(1,0,-1)^{\mathrm T}$．取
$$P=\begin{pmatrix}1&1&1\\0&-1&0\\1&0&-1\end{pmatrix},\qquad P^{-1}AP=\mathrm{diag}(0,-2,-2).$$

[77]
由对称性，$\displaystyle\iint_{[0,1]^2}f(x)f(y)dxdy=A^2$ 被对角线分成两个相等的部分，故
$$I=\frac{A^2}{2}.$$

[78]
设 $u=x-y$，则约束为 $z^2=u^2-1\;(|u|\geqslant1)$，而 $x^2+y^2\geqslant\frac{(x-y)^2}{2}=\frac{u^2}{2}$（等号在 $x=-y$ 时成立），
$$d^2=x^2+y^2+z^2\geqslant\frac{u^2}{2}+u^2-1=\frac32u^2-1\geqslant\frac12 ,$$
在 $u=\pm1,\;z=0,\;x=-y=\pm\frac12$ 处取等．故最短距离为 $\dfrac{\sqrt2}{2}$．

[79]
取对数：$\lim\limits_{x\to0}\frac1x\cdot\frac{1-\cos f(x)}{\sin x}=1$．由 $f(0)=0$ 及 $f'(0)$ 存在，
$$1-\cos f(x)\sim\frac{f^2(x)}{2},\qquad \frac{f^2(x)}{2x^2}\to\frac{[f'(0)]^2}{2}=1 ,$$
故 $f'(0)=\pm\sqrt2$．

[80]
（Ⅰ）$A=2J-E$（$J$ 为全 $1$ 矩阵），特征值 $\lambda_1=5$（对应 $(1,1,1)^{\mathrm T}$），$\lambda_2=\lambda_3=-1$（对应 $x_1+x_2+x_3=0$，如 $(1,-1,0)^{\mathrm T},(1,0,-1)^{\mathrm T}$）．
全部特征向量：$k(1,1,1)^{\mathrm T}\,(k\neq0)$ 与 $k_1(1,-1,0)^{\mathrm T}+k_2(1,0,-1)^{\mathrm T}$（不全为零）．
（Ⅱ）$P=\begin{pmatrix}1&1&1\\1&-1&0\\1&0&-1\end{pmatrix}$，$P^{-1}AP=\mathrm{diag}(5,-1,-1)$．
（Ⅲ）施密特正交化并单位化：
$$Q=\begin{pmatrix}\frac{1}{\sqrt3}&\frac{1}{\sqrt2}&\frac{1}{\sqrt6}\\[2pt]\frac{1}{\sqrt3}&-\frac{1}{\sqrt2}&\frac{1}{\sqrt6}\\[2pt]\frac{1}{\sqrt3}&0&-\frac{2}{\sqrt6}\end{pmatrix},\qquad Q^{-1}AQ=\mathrm{diag}(5,-1,-1).$$

[81]
解空间维数 $=4-2=2$；而 $\alpha_3=2\alpha_1-3\alpha_2$，故 $\alpha_1,\alpha_2$ 是一组基．施密特正交化：
$$\beta_1=(1,1,2,3)^{\mathrm T},\qquad \beta_2=\alpha_2-\frac{(\alpha_2,\beta_1)}{(\beta_1,\beta_1)}\beta_1=\frac23(-2,1,5,-3)^{\mathrm T},$$
单位化得标准正交基
$$e_1=\frac{1}{\sqrt{15}}(1,1,2,3)^{\mathrm T},\qquad e_2=\frac{1}{\sqrt{39}}(-2,1,5,-3)^{\mathrm T}.$$

[82]
下侧时 $d\mathbf S=(z'_x,z'_y,-1)dxdy=(2x,2y,-1)dxdy$，故
$$I=\iint_{x^2+y^2\leqslant1}\big[2x^3-(x^2+y^2)\big]dxdy=0-\frac\pi2=-\frac{\pi}{2}.$$

[83]
$$P\{X>3\}=\mathrm e^{-3\lambda},\qquad 1-\big(1-\mathrm e^{-3\lambda}\big)^3=\frac{26}{27}\Longrightarrow\big(1-\mathrm e^{-3\lambda}\big)^3=\frac1{27},$$
即 $1-\mathrm e^{-3\lambda}=\frac13$，$\mathrm e^{-3\lambda}=\frac23$，故 $\lambda=\dfrac13\ln\dfrac32$．
