[1]
A、B：固定 $x\neq0$ 时 $x\sin\frac1y$ 当 $y\to0$ 无极限，累次极限不存在，错．
C：$f(x,0)\equiv0$，故 $f'_x(0,0)=0$ 存在，错．
D：$|f|\leqslant|x|+|y|\to0=f(0,0)$，连续．选 **D**．

[2]
$\frac{\pi-x}{2}$ 在 $(0,\pi)$ 上的正弦级数为 $\sum\limits_{n=1}^{\infty}\frac{\sin nx}{n}$，即 $b_n=\frac1n$．
当 $x=\frac\pi2$ 时和为 $\frac{\pi-\frac\pi2}{2}=\frac\pi4$，即 $1-\frac13+\frac15-\cdots=\frac\pi4$．

[3]
若存在 $\alpha\neq0$ 使 $A\alpha=0$，则由 $A$ 对称，
$$\alpha^{\mathrm T}(AB+B^{\mathrm T}A)\alpha=(A\alpha)^{\mathrm T}B\alpha+(B\alpha)^{\mathrm T}(A\alpha)=0,$$
与正定性矛盾．故 $AX=0$ 只有零解，$A$ 可逆，$AX=\alpha$ 有唯一解．选 **C**．

[4]
$\mathrm e^x-x,\;\mathrm e^{-x}-x$ 是对应齐次方程的两个线性无关解，故通解
$$y=x+C_1(\mathrm e^{x}-x)+C_2(\mathrm e^{-x}-x).$$

[5]
由 $a=b\times c$ 知 $a\perp b$（$a\cdot b=-3+3=0$ 相容）．又 $|a|=|b||c|\sin\langle b,c\rangle\leqslant|b|\,|c|$，
$$\sqrt{10}\leqslant\sqrt{10}\,r\Longrightarrow r\geqslant1,$$
当 $c\perp b$ 时取等，故 $r_{\min}=1$．

[6]
$f$ 的矩阵 $A=\begin{pmatrix}2&-1&-1\\-1&2&-1\\-1&-1&2\end{pmatrix}$ 的特征值为 $0,3,3$，秩为 $2$ 且半正定，
故标准形只含两个正项．选 **B**．

[7]
$$\frac{\partial P}{\partial x}=\frac{f'}{(y+3)^2}+3y^2,\quad \frac{\partial Q}{\partial y}=-\frac{f'}{(y+3)^2}+3x^2,\quad\frac{\partial R}{\partial z}=3z^2,$$
故 $\mathrm{div}=3(x^2+y^2+z^2)$．由高斯公式（球坐标 $1\leqslant\rho\leqslant2,\;0\leqslant\varphi\leqslant\frac\pi4$）
$$I=3\int_0^{2\pi}\!\!\int_0^{\frac\pi4}\!\!\int_1^2\rho^4\sin\varphi\,d\rho\,d\varphi\,d\theta=6\pi\Big(1-\frac{\sqrt2}{2}\Big)\cdot\frac{31}{5}=\frac{93\pi}{5}\big(2-\sqrt2\big).$$

[8]
（Ⅰ）$\mathrm r(A)=3$，$\alpha_1,\alpha_2,\alpha_3$ 线性无关，是一个极大线性无关组．
（Ⅱ）行变换 $r_2-r_1,\;r_3-2r_2'$ 给出
$$P=\begin{pmatrix}1&0&0\\-1&1&0\\0&-2&1\end{pmatrix},\qquad PA=\begin{pmatrix}1&0&0&0\\0&2&0&0\\0&0&3&-3\end{pmatrix};$$
再作列变换 $c_4+c_3$：
$$Q=\begin{pmatrix}1&0&0&0\\0&1&0&0\\0&0&1&1\\0&0&0&1\end{pmatrix},\qquad PAQ=B .$$

[9]
$f$ 为奇函数 $\Rightarrow G(u)=\int_0^uf(t)dt$ 为偶函数，故
$$F(x)=G(|x|)=G(x)=\int_0^xf(t)dt$$
可导且为偶函数．选 **B**．

[10]
若 $b\neq0$，分子趋于非零常数而分母趋于 $0$，极限为 $\infty$，故 $b=0$．
此时分子 $\sim\frac{x^3}{3}$；若 $a\neq1$，分母 $\sim(1-a)x$，极限为 $0=c$ 矛盾，故 $a=1$，分母 $\sim-\frac{x^3}{6}$，
$$c=\frac{x^3/3}{-x^3/6}=-2 .$$
选 **A**．

[11]
逐次计算得 $A^2=\begin{pmatrix}1&2&1\\0&1&0\\0&0&1\end{pmatrix}$，归纳得 $A^{2k}=\begin{pmatrix}1&2k&k\\0&1&0\\0&0&1\end{pmatrix}$，故
$$A^{18}=\begin{pmatrix}1&18&9\\0&1&0\\0&0&1\end{pmatrix}.$$

[12]
（Ⅰ）$f_n(0)=-1<0$，$f_n(1)=1-\cos1>0$，且 $f_n'(x)=nx^{n-1}+\sin x>0\;(0<x<1)$，
故 $f_n$ 严格增，$f_n(x)=0$ 在 $(0,1)$ 内有唯一实根 $x_n$．
（Ⅱ）由 $x_n^n=\cos x_n$ 得 $\ln\cos x_n=n\ln x_n$，故
$$x_n^{\frac1n\ln\cos x_n}=x_n^{\ln x_n}=\mathrm e^{(\ln x_n)^2}.$$
若 $x_n\to L<1$，则 $x_n^n\to0$ 而 $\cos x_n\to\cos L>0$，矛盾，故 $x_n\to1$，$\ln x_n\to0$，原式极限 $=1$．

[13]
$\ln z=y\ln(1+xy)$，
$$z'_x=z\cdot\frac{y^2}{1+xy}\Big|_{(1,1)}=2\cdot\frac12=1,\qquad
z'_y=z\Big[\ln(1+xy)+\frac{xy}{1+xy}\Big]_{(1,1)}=2\Big(\ln2+\frac12\Big)=2\ln2+1 .$$
故 $\mathrm dz\big|_{(1,1)}=\mathrm dx+(2\ln2+1)\mathrm dy$．

[14]
三平面交于一条直线 $\Rightarrow$ 方程组有解且解集为一维，故 $\mathrm r(A)=\mathrm r(\overline A)=3-1=2$．选 **A**．

[15]
（Ⅰ）由 $(1-x-x^2)\sum a_nx^n=1$ 比较系数得 $a_0=1$，$a_1-a_0=0$（$a_1=1$），$a_{n+2}-a_{n+1}-a_n=0$．
（Ⅱ）由 $a_{n+2}-a_n=a_{n+1}$ 得
$$\frac{a_{n+1}}{a_na_{n+2}}=\frac{1}{a_n}-\frac{1}{a_{n+2}},$$
部分和 $=\frac{1}{a_1}+\frac{1}{a_2}-\frac{1}{a_{N+1}}-\frac{1}{a_{N+2}}$．因 $a_n\to+\infty$（斐波那契型），级数收敛且
$$\sum_{n=1}^{\infty}\frac{a_{n+1}}{a_na_{n+2}}=1+\frac12=\frac32 .$$

[16]
$\mathrm{Cov}(Y,Z)=a\,\mathrm{Cov}(X,Y)$，$\sigma_Z=|a|\sigma_X$，故 $\rho_{YZ}=\mathrm{sgn}(a)\rho_{XY}$．
因 $\rho_{XY}\neq0$，$\rho_{YZ}=\rho_{XY}\iff a>0$．选 **A**．

[17]
星形线围成面积 $=\frac38\pi t^2$．当 $t\to0^+$ 时由对称性 $\iint_{D_t}\sin x\,d\sigma=0$，$\iint_{D_t}\cos y\,d\sigma\approx$ 面积，
$$\lim_{t\to0^+}\frac{1}{t^2}\cdot\frac38\pi t^2=\frac{3\pi}{8}.$$
选 **C**．

[18]
在 $S$ 上 $\sqrt{x^2+y^2+z^2}=R$，故 $I=\iint_S x\,dydz+\frac{(R+z)^2}{R}dxdy$（下侧）．
上半球面取上侧时 $\iint x\,dydz=\frac23\pi R^3$，故下侧为 $-\frac23\pi R^3$；又
$$\iint_S\frac{(R+z)^2}{R}dxdy=-\frac1R\int_0^{2\pi}\!\!\int_0^R\big(R+\sqrt{R^2-r^2}\big)^2r\,dr\,d\theta=-\frac{17}{6}\pi R^3 .$$
故 $I=-\frac23\pi R^3-\frac{17}{6}\pi R^3=-\dfrac{7}{2}\pi R^3$．

[19]
$P\{Y>t\}=P\{[0,t]\text{ 内无故障}\}=P\{X=0\}=\mathrm e^{-\lambda t}$．

[20]
由 $f$ 的奇偶性与 $f+f'=2\mathrm e^x$ 联立可解出 $f$．按奇函数：$-f+f'=2\mathrm e^{-x}$，与原式相加得 $f'=\mathrm e^x+\mathrm e^{-x}$，$f=\mathrm e^x-\mathrm e^{-x}$，于是 $f'-\mathrm e^x=\mathrm e^{-x}$，条件化为
$$a\mathrm e^{-x}\leqslant x\iff a\leqslant x\mathrm e^{x}\;(\forall x)\iff a\leqslant\min_{x}x\mathrm e^x=-\frac1{\mathrm e}.$$
选 **B**．（若按题面“偶函数”，则 $f=\mathrm e^x+\mathrm e^{-x}$，条件给出 $a\geqslant\frac1{\mathrm e}$，与四个选项均不符，故“偶”疑为“奇”，请核对．）

[21]
列变换：$C=(\alpha_1,\,-4\alpha_3,\,-\alpha_2)=AQ$，其中 $Q=\begin{pmatrix}1&0&0\\0&0&-1\\0&-4&0\end{pmatrix}$．
由 $BA=C=AQ$ 得 $B=AQA^{-1}$，故 $\mathrm{tr}(B)=\mathrm{tr}(Q)=1$．

[22]
只知两个偏导数存在，A、C 需可微，D 需极限存在，均不成立．
B：曲线 $z=f(x,0)$ 在 $x=0$ 处切向量为 $(1,0,f'_x(0,0))=(1,0,1)$，正确．选 **B**．

[23]
设 $r=\sqrt{x^2+y^2}$，则 $z_{xx}+z_{yy}=f''(r)+\frac{f'(r)}{r}=r^2$，即 $(rf')'=r^3$，
$$rf'=\frac{r^4}{4}+C_1,\qquad f(r)=\frac{r^4}{16}+C_1\ln r+C_2 ,$$
故 $z=\dfrac{(x^2+y^2)^2}{16}+C_1\ln\sqrt{x^2+y^2}+C_2$．

[24]
（Ⅰ）$E(2\overline X)=2\cdot\frac\theta2=\theta$；$EX_{(n)}=\frac{n}{n+1}\theta$ 故 $E\big(\frac{n+1}{n}X_{(n)}\big)=\theta$，均为无偏估计．
（Ⅱ）
$$D\hat\theta_1=\frac{4}{n}\cdot\frac{\theta^2}{12}=\frac{\theta^2}{3n},\qquad
D\hat\theta_2=\Big(\frac{n+1}{n}\Big)^2\frac{n\theta^2}{(n+2)(n+1)^2}=\frac{\theta^2}{n(n+2)} .$$
当 $n\geqslant2$ 时 $\frac{1}{n(n+2)}<\frac{1}{3n}$，故 $\hat\theta_2$ 更有效．

[25]
由 $b_{n+1}(b_{n+1}-b_n)=a_n>0$ 及 $b_n>0$ 知 $\{b_n\}$ 单调增．
若 $b_n\to L$，则 $a_n\leqslant L(b_{n+1}-b_n)$，$\sum a_n\leqslant L(L-b_1)<+\infty$；
若 $\sum a_n$ 收敛，由 $b_{n+1}>b_1=1$ 得 $a_n\geqslant b_{n+1}-b_n$，故 $\sum(b_{n+1}-b_n)$ 收敛，$\{b_n\}$ 收敛．
选 **C**．

[26]
$x\to0^+$ 时 $\frac{1-\cos x}{\sqrt x}\sim\frac{x^{3/2}}{2}\to0$；$x\to0^-$ 时 $x^2\varphi(x)\to0=f(0)$，连续．
$$f'_+(0)=\lim_{x\to0^+}\frac{1-\cos x}{x\sqrt x}=0,\qquad f'_-(0)=\lim_{x\to0^-}x\varphi(x)=0 ,$$
故 $f'(0)=0$ 存在．选 **A**．

[27]
$$f(x)=\begin{cases}x+2^x,&x<0,\\ \frac12,&x=0,\\ 0,&x>0 .\end{cases}$$
$f$ 有界且只有一个跳跃点，故 $F$ 连续；又 $F'_-(0)=f(0^-)=1$，$F'_+(0)=f(0^+)=0$，
故 $F$ 在 $x=0$ 连续但不可导．选 **C**．

[28]
$\alpha^{\mathrm T}\alpha=2k^2$，
$$(E-\alpha\alpha^{\mathrm T})\Big(E+\frac1k\alpha\alpha^{\mathrm T}\Big)=E+\Big(\frac1k-1-2k\Big)\alpha\alpha^{\mathrm T}=E$$
要求 $\frac1k-1-2k=0$，即 $2k^2+k-1=0$，故 $k=\dfrac12$ 或 $k=-1$．

[29]
（Ⅰ）$\int_0^{+\infty}\!\!\int_0^{+\infty}k\mathrm e^{-(4x+3y)}dxdy=\frac{k}{12}=1\Rightarrow k=12$，
此时 $f(x,y)=(4\mathrm e^{-4x})(3\mathrm e^{-3y})=f_X(x)f_Y(y)$，故 $X,Y$ **相互独立**．
（Ⅱ）$z>0$ 时
$$f_Z(z)=\int_0^z4\mathrm e^{-4x}\cdot3\mathrm e^{-3(z-x)}dx=12\big(\mathrm e^{-3z}-\mathrm e^{-4z}\big),$$
$z\leqslant0$ 时 $f_Z(z)=0$．

[30]
本题 $Q(x,y)$ 的表达式在原始材料中缺失，无法给出确定答案，解法如下：
（Ⅰ）由与路径无关的充要条件 $\frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x}$，其中 $\frac{\partial P}{\partial y}=\mathrm e^{-x}-f'(x)$，
可得 $f$ 满足的二阶线性微分方程，结合 $f'(0)=0$ 解出 $f(x)$；
（Ⅱ）求出势函数 $u(x,y)$，由 $u(1,0)-u(-1,1)=\frac4{\mathrm e}$ 定出待定常数，再用 $f'(x)=0$ 与 $f''$ 的符号判定极值．
（$Q$ 补全后可按此计算，请核对原书．）

[31]
$$E\Big(\sum_{i=1}^{10}X_i\Big)=0.2\sum_{i=1}^{10}i=11,\qquad D\Big(\sum X_i\Big)=0.16\sum_{i=1}^{10}i=8.8 .$$
$$P\{6<\textstyle\sum X_i<16\}=P\{|\textstyle\sum X_i-11|<5\}\geqslant1-\frac{8.8}{25}=0.648 .$$

[32]
设 $P$ 为交换 $i,j$ 的初等（置换）矩阵，则 $P^{\mathrm T}=P=P^{-1}$，而 $B=PAP=P^{-1}AP=P^{\mathrm T}AP$，
故 $A,B$ 既等价、又相似、又合同．选 **A**．

[33]
$f(a)=0$，$f'(x)=-\mathrm e^{(a-x)(a+x)}=-\mathrm e^{a^2-x^2}$，于是
$$S=\int_0^af(x)dx=\big[xf(x)\big]_0^a-\int_0^axf'(x)dx=\int_0^ax\mathrm e^{a^2-x^2}dx=\frac12\big(\mathrm e^{a^2}-1\big).$$

[34]
曲线即 $y=\dfrac{1-|x|}{1+|x|}\;(|x|\leqslant1)$，$D$ 关于 $y$ 轴对称，故 $\iint_Dx\,d\sigma=0$．
$$I=2\int_0^1dx\int_0^{g(x)}\big[2\ln(1+y)-y\big]dy,\qquad g(x)=\frac{1-x}{1+x}.$$
令 $u=1+x$，内层 $=\frac4u\ln\frac2u-\frac2u-\frac{2}{u^2}+\frac32$，故
$$I=2\int_1^2\Big(\frac4u\ln\frac2u-\frac2u-\frac2{u^2}+\frac32\Big)du=2\Big(2\ln^22-2\ln2+\frac12\Big)=(2\ln2-1)^2 .$$

[35]
$AB$ 的行向量是 $B$ 的行向量的线性组合；又 $\mathrm r(A)=n$ 时存在 $C$ 使 $CA=E_n$，故 $B=C(AB)$，
$B$ 的行向量也是 $AB$ 的行向量的线性组合，两行向量组等价．选 **B**．

[36]
令 $t=x+2$，$\sin\frac{\pi x}{2}=\sin\Big(\frac{\pi t}{2}-\pi\Big)=-\sin\frac{\pi t}{2}$，故
$$f(x)=-\sum_{n=0}^{\infty}\frac{(-1)^n}{(2n+1)!}\Big(\frac{\pi}{2}\Big)^{2n+1}(x+2)^{2n+1}
=\sum_{n=0}^{\infty}\frac{(-1)^{n+1}\pi^{2n+1}}{2^{2n+1}(2n+1)!}(x+2)^{2n+1},\quad -\infty<x<+\infty .$$

[37]
$|f|\leqslant\frac\pi2|y|\to0$，连续；$f(x,0)\equiv0\Rightarrow f'_x(0,0)=0$，$f'_y(0,0)=\lim\limits_{y\to0}\arctan\frac{1}{|y|}=\frac\pi2$．
又 $\arctan\frac1\rho=\frac\pi2-\arctan\rho\;(\rho>0)$，
$$\frac{\big|f-0\cdot x-\frac\pi2y\big|}{\rho}=\frac{|y\arctan\rho|}{\rho}\leqslant\arctan\rho\to0 ,$$
故在 $(0,0)$ 处**可微**．选 **C**．

[38]
$\mathrm{Cov}(X+Y,X-Y)=DX-DY=0\iff DX=DY$，即
$$E(X^2)-(EX)^2=E(Y^2)-(EY)^2\iff E(X^2)+(EY)^2=E(Y^2)+(EX)^2 .$$
选 **C**．

[39]
$\oint_L f'_x dx+f'_ydy=\oint_L \mathrm df=0$．对 $\oint_L(-3y)dx$，逆时针时由格林公式等于 $3\cdot$ 面积 $=3\cdot2\pi=6\pi$，
本题取顺时针，故 $I=-6\pi$．

[40]
所列选项是**错误**的：取 $f(x)=-x^2\big(2+\sin\frac1x\big)\;(x\neq0),\,f(0)=0$，则 $f$ 在 $x=0$ 取极大值，
但在 $0$ 的任何邻域内 $f$ 都不单调，故“左增右减”不成立．（其余选项原始材料缺失，待核对．）

[41]
$r_2-2r_1$、$r_3+r_1$ 得
$$\begin{pmatrix}1&2&1&3\\0&k&-7&0\\0&0&k+1&0\end{pmatrix},$$
有无穷多解需系数矩阵秩 $<3$，即 $k(k+1)=0$．验证 $k=0$ 与 $k=-1$ 时秩均为 $2$ 且相容，故 $k=0$ 或 $k=-1$．

[42]
令 $p=y'$，$x^2p'=p^2$，分离变量 $\frac{dp}{p^2}=\frac{dx}{x^2}$，得 $\frac1p=\frac1x-C$，即 $p=\frac{x}{1-Cx}$．
由相切条件 $y'(1)=1$ 得 $C=0$，故 $y'=x$，$y=\frac{x^2}{2}+D$；再由 $y(1)=0$ 得 $D=-\frac12$．
所求积分曲线 $y=\dfrac{x^2-1}{2}$．

[43]
（Ⅰ）设 $c_1\alpha_1+c_2\alpha_2+c_3\alpha_3=0$．用 $A-kE$ 作用（注意 $(A-kE)\alpha_1=0,(A-kE)\alpha_2=\alpha_1,(A-kE)\alpha_3=\alpha_2$）得 $c_2\alpha_1+c_3\alpha_2=0$；再作用一次得 $c_3\alpha_1=0$，由 $\alpha_1\neq0$ 依次得 $c_3=c_2=c_1=0$．故三向量线性无关，构成 $\mathbf R^3$ 的基．
（Ⅱ）记 $P=(\alpha_1,\alpha_2,\alpha_3)$，则 $AP=PB$，$B=\begin{pmatrix}k&1&0\\0&k&1\\0&0&k\end{pmatrix}$．
$A\alpha_1,A\alpha_2,A\alpha_3$ 线性相关 $\iff|AP|=0\iff|A|=|B|=k^3=0\iff k=0$．
此时 $A\sim B$，故 $\mathrm r(A)=\mathrm r(B)=2$，$\mathrm{tr}(A)=\mathrm{tr}(B)=0$．

[44]
$\tan\big(x-\frac\pi4\big)$ 在 $x=\frac{3\pi}{4},\frac{7\pi}{4}$ 处无定义，这是 $(0,2\pi)$ 内仅有的间断点．
在这两点处底数 $1+x>1$，而指数当 $x\to x_0^-$ 时 $\to+\infty$、$x\to x_0^+$ 时 $\to-\infty$，
故 $f\to+\infty$ 与 $f\to0$，均为**第二类（无穷）间断点**．

[45]
$f(x,0)\equiv0,\;f(0,y)\equiv0\Rightarrow f'_x(0,0)=f'_y(0,0)=0$．
当 $y\neq0$ 时 $f'_x(0,y)=\lim\limits_{x\to0}\frac{(x^2+y^2)\sin(xy^2)}{x(x^2+y^4)}=1$，故
$$f''_{xy}(0,0)=\lim_{y\to0}\frac{1-0}{y}=\infty\ \text{不存在}.$$
当 $x\neq0$ 时 $f'_y(x,0)=\lim\limits_{y\to0}\frac{(x^2+y^2)\sin(xy^2)}{y(x^2+y^4)}=0$，故 $f''_{yx}(0,0)=0$ 存在．选 **B**．

[46]
视 $p=y'$ 为 $y$ 的函数，$y''=p\frac{dp}{dy}$，令 $u=p^2$，方程化为 $u'+u=4y$，
$$u=4y-4+C\mathrm e^{-y};\qquad y=2,p=2\Rightarrow u=4\Rightarrow C=0 .$$
故 $y'=2\sqrt{y-1}$，$\sqrt{y-1}=x+C_1$，由 $y(0)=2$ 得 $C_1=1$，
$$y=(x+1)^2+1 .$$

[47]
$G(x)=0\,(x<0),\;x\,(0\leqslant x\leqslant1),\;1\,(x>1)$，故 $Y=G(X)=\min\{X,1\}$（$X>0$）．
$P\{Y=1\}=P\{X>1\}=\mathrm e^{-\lambda}>0$，故 $Y$ 既非连续型也非均匀分布；而 $Y$ 在 $(0,1)$ 上取值连续，也非离散型．
$F_Y$ 在 $y=1$ 处有跳跃．选 **D**．

[48]
条件收敛于 $x=2$ 知收敛半径 $R=2$，新级数中心为 $1$、半径仍为 $2$，$x=-1$ 恰为端点．
记 $b_n=a_n2^n$（$\sum b_n$ 条件收敛），$x=-1$ 时通项为 $\frac{(-1)^nb_n}{n+1}$．
取 $b_n=\frac{(-1)^n}{n}$ 时该级数绝对收敛；取 $b_n=\frac{(-1)^n}{\ln n}$ 时通项为 $\frac{1}{(n+1)\ln n}$，级数发散．
故由条件不能判定．选 **D**．

[49]
$\beta^{\mathrm T}\alpha=2-2+0=0\Rightarrow A^2=\alpha(\beta^{\mathrm T}\alpha)\beta^{\mathrm T}=O$，故
$$(A+E)^n=E+nA=\begin{pmatrix}1+2n&4n&0\\-n&1-2n&0\\3n&6n&1\end{pmatrix}.$$

[50]
$L_1$ 过 $(1,0,0)$，方向 $s_1=(0,1,1)$；$L_2$ 过 $(0,0,-2)$，方向 $s_2=(2,-1,0)$．
$s_1\times s_2=(1,2,-2)$，$|s_1\times s_2|=3$，$\overrightarrow{P_1P_2}=(-1,0,-2)$，
$$d=\frac{|(-1,0,-2)\cdot(1,2,-2)|}{3}=\frac{|-1+4|}{3}=1 .$$

[51]
在 $L$ 上 $|x|+|y|=1$，故 $I=a\oint_Lx\,dy-b\oint_Ly\,dx=a\cdot S-b\cdot(-S)$，
其中 $S=2$ 为正方形面积，$I=2(a+b)$．选 **B**．

[52]
$D$ 关于直线 $y=x$ 对称，且在 $T(x,y)=(1-y,1-x)$ 下不变，故 $\iint_Dx\,d\sigma=\iint_D(1-y)d\sigma$，
得 $\iint_Dx\,d\sigma=\iint_Dy\,d\sigma=\frac12S$，其中 $S=\frac\pi2-1$ 为透镜形面积．于是 $\iint_D2x\,d\sigma=S$．
又 $\iint_Dy^2d\sigma=\frac12\iint_D(x^2+y^2)d\sigma$，将 $D$ 分成两个弓形并用 $T$ 对称化算得
$$\iint_D(x^2+y^2)d\sigma=\frac{3\pi}{4}-2 .$$
故
$$I=\Big(\frac\pi2-1\Big)-\frac12\Big(\frac{3\pi}{4}-2\Big)=\frac{\pi}{8}.$$

[53]
条件等价于 $-X^{\mathrm T}X<X^{\mathrm T}AX<X^{\mathrm T}X$，即 $E-A$ 与 $E+A$ 均正定．
$E-A=\begin{pmatrix}1-a&1-a\\1-a&2-a\end{pmatrix}$ 正定 $\iff1-a>0$ 且 $(1-a)>0\iff a<1$；
$E+A=\begin{pmatrix}1+a&a-1\\a-1&a\end{pmatrix}$ 正定 $\iff 1+a>0$ 且 $3a-1>0\iff a>\frac13$．
故 $a\in\big(\frac13,1\big)$，选 **A**．

[54]
侧面上 $x^2+y^2=1$，单位外法向 $(x,y,0)$，$dydz=x\,dS$：
$$\iint_{\text{侧}}\frac{x\,dydz}{1+z^2}=\int_{-1}^{1}\!\!\int_0^{2\pi}\frac{\cos^2\theta}{1+z^2}d\theta\,dz=\pi\cdot\frac\pi2=\frac{\pi^2}{2};$$
上底 $z=1$：$\iint_{r\leqslant1}\frac{d\sigma}{1+r^2}=\pi\ln2$；下底 $z=-1$（下侧）：$-\pi\ln2$；侧面上 $dxdy$ 项为 $0$．
故 $I=\dfrac{\pi^2}{2}$．

[55]
$$V(\xi)=\pi\int_0^{\xi}\frac{x\,dx}{(1+x^2)^2}=\frac\pi2\cdot\frac{\xi^2}{1+\xi^2},\qquad \lim_{\xi\to+\infty}V(\xi)=\frac\pi2 .$$
由 $V(a)=\frac\pi4$ 得 $\frac{a^2}{1+a^2}=\frac12$，故 $a=1$．

[56]
（Ⅰ）$y'=2^{|\sin x|}\ln2\cdot\mathrm{sgn}(\sin x)\cos x\;(x\neq k\pi)$．
（Ⅱ）$y'=\dfrac{\sec^2x+\sec x\tan x}{\tan x+\sec x}=\sec x$．
（Ⅲ）$y'=(1+x^2)^{\sin x}\Big[\cos x\ln(1+x^2)+\dfrac{2x\sin x}{1+x^2}\Big]$．
（Ⅳ）$y=-\ln\big(x+\sqrt{x^2+1}\big)$，$y'=-\dfrac{1}{\sqrt{1+x^2}}$．

[57]
$X\leqslant Y\Rightarrow X\leqslant2Y$，故 $P\{U=0,V=1\}=0$．又
$$P\{U=0,V=0\}=P\{X\leqslant Y\}=\frac14,\quad P\{U=1,V=0\}=P\{Y<X\leqslant2Y\}=\frac12-\frac14=\frac14,\quad P\{U=1,V=1\}=\frac12 .$$
因 $P\{U=0\}P\{V=0\}=\frac14\cdot\frac12=\frac18\neq\frac14=P\{U=0,V=0\}$，故 $U$ 与 $V$ **不独立**．

[58]
$\ln f=-2\ln|y|-\frac{(x-a)^2+(y-1)^2}{2y^2}$．由 $\frac{\partial}{\partial x}$ 得 $x=a$；代入后
$$g(y)=-2\ln|y|-\frac{(y-1)^2}{2y^2},\qquad g'(y)=-\frac2y-\frac1{y^2}+\frac1{y^3}=\frac{-2y^2-y+1}{y^3},$$
驻点 $y=\frac12$ 与 $y=-1$，且两处 $g$ 均由增变减，故均为极大值点：
$$f\Big(a,\frac12\Big)=4\mathrm e^{-\frac12},\qquad f(a,-1)=\mathrm e^{-2},$$
均为极大值，无极小值．

[59]
$$f(x)=\frac{x}{(x-2)(x-3)}=-\frac{2}{x-2}+\frac{3}{x-3},\qquad x-2=3+(x-5),\;x-3=2+(x-5),$$
$$f(x)=\sum_{n=0}^{\infty}(-1)^n\Big[\frac{3}{2^{n+1}}-\frac{2}{3^{n+1}}\Big](x-5)^n,\qquad |x-5|<2 .$$

[60]
$DX_1=p(1-p),\;DX_2=2p(1-p),\;\mathrm{Cov}(X_1,X_2)=0$，
$$\mathrm{Cov}(Z_1,Z_2)=2DX_1-DX_2=0,$$
故不相关．但 $P\{Z_1=0,Z_2=0\}=(1-p)^3$ 而 $P\{Z_1=0\}P\{Z_2=0\}=(1-p)^3\big[(1-p)^3+2p^2(1-p)\big]\neq(1-p)^3$，
故不独立．选 **B**．

[61]
$\mathrm r(A)=1\Rightarrow Ax=0$ 的解空间维数为 $3$，故 $\mathrm r(\alpha_1,\alpha_2,\alpha_3,\alpha_4)=3$，即
$$|(\alpha_1,\alpha_2,\alpha_3,\alpha_4)|=-(a-4)(a+3)(a-1)=0\Longrightarrow a=1,4,-3 .$$
逐一验证秩确为 $3$．于是 $Ax=0$ 的通解即这四个向量的极大无关组的线性组合：
当 $a=1$ 或 $a=4$ 时 $x=k_1\alpha_1+k_2\alpha_2+k_3\alpha_3$；
当 $a=-3$ 时（此时 $\alpha_3=\alpha_2-2\alpha_1$ 型相关）取 $x=k_1\alpha_1+k_2\alpha_2+k_3\alpha_4$，$k_i$ 为任意常数．

[62]
（Ⅰ）$X_{n+1}-\overline X\sim N\big(0,\frac{n+1}{n}\sigma^2\big)$，故 $Y\sim\chi^2(1)$，$EY=1,\;DY=2$．
（Ⅱ）$\frac{(n-1)S^2}{\sigma^2}\sim\chi^2(n-1)$ 且与 $Y$ 独立，
$$F=\frac{Y/1}{\frac{(n-1)S^2/\sigma^2}{n-1}}=\frac{n(X_{n+1}-\overline X)^2}{(n+1)S^2}\sim F(1,n-1),$$
故 $k=\dfrac{n}{n+1}$．

[63]
齐次型方程．设 $u=\frac yx\;(x>0)$，则 $xu'=\sqrt{1+u^2}$，
$$\frac{du}{\sqrt{1+u^2}}=\frac{dx}{x}\Longrightarrow \ln\big(u+\sqrt{1+u^2}\big)=\ln x+C ,$$
即 $u+\sqrt{1+u^2}=Cx$，还原得通解
$$y+\sqrt{x^2+y^2}=Cx^2 .$$

[64]
（Ⅰ）$\overline{AB}$ 上点满足 $x=0,\;y=z$，绕 $z$ 轴旋转后到轴距离 $=z$，故 $\Sigma:\;z=\sqrt{x^2+y^2}\;(1\leqslant z\leqslant2)$．
（Ⅱ）锥面以原点为顶点，位置向量 $(x,y,z)$ 与法向量正交，故含 $f$ 的三项
$f\big(\frac xy\big)\,(x,y,z)\cdot d\mathbf S=0$，于是
$$I=\iint_\Sigma x\,dydz+y\,dzdx+4z\,dxdy .$$
补上 $z=2\,(r\leqslant2)$ 上侧与 $z=1\,(r\leqslant1)$ 下侧，$V:\;1\leqslant z\leqslant2,\;r\leqslant z$，$\mathrm{div}=6$，
$$6\iiint_VdV=6\cdot\frac{7\pi}{3}=14\pi=\iint_{\text{锥,外}}+32\pi-4\pi\Longrightarrow \iint_{\text{锥,外}}=-14\pi ,$$
内侧与外侧反向，故 $I=14\pi$．

[65]
$\beta^{\mathrm T}\alpha=1+1+1=3$，故 $A^n=(\beta^{\mathrm T}\alpha)^{n-1}A=3^{n-1}\alpha\beta^{\mathrm T}$，即
$$A^n=3^{\,n-1}\begin{pmatrix}1&\frac12&\frac13\\2&1&\frac23\\3&\frac32&1\end{pmatrix}.$$

[66]
把 $3$ 个次品的位置看作 $\{1,\cdots,10\}$ 的随机 $3$ 元子集（共 $C_{10}^3=120$ 种）．
"第 $7$ 次测出第 $3$ 个次品"即最大位置为 $7$：$C_6^2=15$ 种，概率 $\frac{15}{120}=\frac18$．
（若把"前 $7$ 次全为合格品、余下 $3$ 个必为次品"也算作第 $7$ 次找齐，则再加 $\frac{1}{120}$，共 $\frac{2}{15}$．）

[67]
$|xE-A|=(x-1)^3$，$|A|=1$，故 $f(x)=(x-1)^3-1$，$f(0)=-2,\;f(1)=-1$．
由拉格朗日中值定理存在 $x_0\in(0,1)$ 使 $f'(x_0)=f(1)-f(0)=1$，即切线斜率为 $1$，与 $y=x$ 平行．选 **C**．

[68]
对增广矩阵作行变换得
$$\begin{pmatrix}1&1&1&1\\0&1&-1&b\\0&0&a-1&2-b\\0&0&0&4-2b\end{pmatrix}.$$
（1）$b\neq2$ 时方程组无解，$\beta$ **不能**由 $\alpha_1,\alpha_2,\alpha_3$ 线性表示；
（2）$b=2,\;a\neq1$ 时有唯一解 $x=(-1,2,0)$，即 $\beta=-\alpha_1+2\alpha_2$；
（3）$b=2,\;a=1$ 时有无穷多解，$\beta=(-1-2t)\alpha_1+(2+t)\alpha_2+t\alpha_3$（$t$ 为任意常数）．
