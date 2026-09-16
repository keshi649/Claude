[1]
齐次线性方程的解全体为 $y=C\mathrm e^{-\int P}$，两特解 $y_1=C_1\mathrm e^{-\int P},\,y_2=C_2\mathrm e^{-\int P}$．
则 $y_1-y_2=(C_1-C_2)\mathrm e^{-\int P}$ 不是常数（因 $P\not\equiv0$），故 **A** 错误；B、C、D 均正确．

[2]
$AB=O,\,B\neq O\Rightarrow\mathrm r(A)+\mathrm r(B)\leqslant3$ 且 $\mathrm r(A)\leqslant2$，故 $|A|=-(k-1)^2(k+3)=0$，$k=1$ 或 $-3$．
$k=1$ 时 $\mathrm r(A)=1$，$\mathrm r(B)$ 可为 $1$ 或 $2$，不能确定；
$k=-3$ 时 $\mathrm r(A)=2$，故 $1\leqslant\mathrm r(B)\leqslant1$，即 $\mathrm r(B)=1$．选 **B**．

[3]
A 反例 $u_n=n,\,v_n=\frac1{n^3}$；C 反例 $u_n=-n,\,v_n=\frac1{n^2}$；D 显然错．
B：由 $(u_n+v_n)^2\leqslant2(u_n^2+v_n^2)$ 及比较判别法知收敛．选 **B**．

[4]
由 $\sum\limits_{k=0}^{\infty}\frac{C}{k!}=C\mathrm e=1$ 得 $C=\mathrm e^{-1}$，即 $X\sim P(1)$，
$$E(X^2)=DX+(EX)^2=1+1=2 .$$

[5]
$D$ 关于 $y$ 轴对称而 $\frac{x}{2x^2+y^2}$ 关于 $x$ 为奇函数，故只需算 $\iint_D\frac{d\sigma}{2x^2+y^2}$．
在右半部分作变换 $u=x,\;v=y-x$（雅可比为 $1$），区域变为 $1\leqslant u^2+v^2\leqslant2,\;u\geqslant0,\;v\geqslant-u$，
被积函数变为 $\dfrac{1}{3u^2+2uv+v^2}$．用极坐标（$r\in[1,\sqrt2]$，$\varphi\in[-\frac\pi4,\frac\pi2]$）：
$$I=2\int_1^{\sqrt2}\frac{dr}{r}\int_{-\frac\pi4}^{\frac\pi2}\frac{d\varphi}{2+\cos2\varphi+\sin2\varphi}=2\cdot\frac{\ln2}{2}\cdot\frac{\sqrt2\pi}{4}=\frac{\sqrt2\pi\ln2}{4}.$$

[6]
由通解知 $\mathrm r(A)=1$，$A(-2,1)^{\mathrm T}=0$，$A(3,-4)^{\mathrm T}=(3,2)^{\mathrm T}$．
将 $\beta=(5,-10)^{\mathrm T}$ 分解：$\beta=2(-2,1)^{\mathrm T}+3(3,-4)^{\mathrm T}$，故 $A\beta=3(3,2)^{\mathrm T}=(9,6)^{\mathrm T}$，
$$\beta^{\mathrm T}A\beta=5\cdot9+(-10)\cdot6=-15 .$$

[7]
检验方差：$H_0:\sigma^2\leqslant15^2$．
$$\chi^2=\frac{(n-1)S^2}{\sigma_0^2}=\frac{9\times900}{225}=36>\chi^2_{0.05}(9)=16.919 ,$$
落入拒绝域，故认为标准差显著超过 $15$ g，**机器生产不正常**．

[8]
$L$ 由两条半径段和一段圆弧组成：
$$\int_{\theta=0}=\int_{\theta=\frac\pi4}=\int_0^a\mathrm e^rdr=\mathrm e^a-1,\qquad \int_{r=a}=\mathrm e^a\cdot a\cdot\frac\pi4 .$$
故 $I=2(\mathrm e^a-1)+\dfrac{\pi a}{4}\mathrm e^a$．

[9]
原式 $=\displaystyle\int_1^{+\infty}\frac{dx}{x\sqrt{x-1}};\overset{t=\sqrt{x-1}}{=\!=\!=};\int_0^{+\infty}\frac{2dt}{1+t^2}=\pi$．选 **C**．

[10]
$$\mathrm{Cov}(X,Y)=\mathrm{Cov}(X,X^2+X)=EX^3+EX^2-EX\cdot E(X^2+X)=1\neq0 ,$$
故相关；又 $Y$ 是 $X$ 的函数，必不独立．选 **A**．

[11]
$L_1$：点 $A(-2,3,-1)$，方向 $s_1=(1,-1,1)$；$L_2$：点 $B(-4,0,4)$，方向 $s_2=(2,1,3)$．
公垂线方向 $s=s_1\times s_2=(-4,-1,3)$．过 $L_1$ 且含 $s$ 的平面：$2x+7y+5z-12=0$；
过 $L_2$ 且含 $s$ 的平面：$3x-9y+z+8=0$．故公垂线为
$$\begin{cases}2x+7y+5z-12=0,\\3x-9y+z+8=0,\end{cases}\qquad\text{即}\qquad \frac{x}{4}=\frac{y-1}{1}=\frac{z-1}{-3}.$$

[12]
（Ⅰ）$\mathrm r(A)=1$，$A$ 的行向量与 $(-1,1,0),(2,0,1)$ 正交，故各行都平行于 $(1,1,-2)$．
设 $A=\eta\,(1,1,-2)$，由 $A(1,1,-2)^{\mathrm T}=b$ 得 $6\eta=b$，$\eta=(1,1,-2)^{\mathrm T}$，即
$$A=\begin{pmatrix}1&1&-2\\1&1&-2\\-2&-2&4\end{pmatrix}=\eta\eta^{\mathrm T}.$$
（Ⅱ）$A^2=\eta(\eta^{\mathrm T}\eta)\eta^{\mathrm T}=6A$，取 $\alpha=(1,1,-2)^{\mathrm T}$，则 $A^2=\alpha\beta$ 中
$$\beta=(6,6,-12).$$
（Ⅲ）$X^{\mathrm T}AX=(\eta^{\mathrm T}X)^2=0\iff x_1+x_2-2x_3=0$，故全部解为
$$X=k_1(-1,1,0)^{\mathrm T}+k_2(2,0,1)^{\mathrm T}.$$

[13]
令 $u=x-2$，$y=(u^2-1)^2=u^4-2u^2+1$，$y''=12u^2-4$ 在 $u=\pm\frac{1}{\sqrt3}$ 处变号，
故有 $2$ 个拐点．选 **C**．

[14]
对 $a$ 求导得 $f'(x+a)=\dfrac{(x+a)[(x+a)^2+1]}{f(x+a)}$，即 $f(t)f'(t)=t^3+t$，
$$\frac{f^2}{2}=\frac{t^4}{4}+\frac{t^2}{2}+C .$$
由 $f(1)=\sqrt2$ 得 $C=\frac14$，故 $f^2=\dfrac{(x^2+1)^2}{2}$，
$$f(x)=\frac{\sqrt2}{2}(1+x^2).$$

[15]
$P\{X\leqslant2\}=\frac12$，$P\{-1<X\leqslant2\}=\frac12-\frac13=\frac16$．
$$P\{\max\leqslant2,\min\leqslant-1\}=P\{\max\leqslant2\}-P\{-1<X\leqslant2,-1<Y\leqslant2\}=\frac14-\frac1{36}=\frac29 .$$

[16]
特征方程 $\lambda^2-\lambda-2=0$，$\lambda=2,-1$，$f=C_1\mathrm e^{2x}+C_2\mathrm e^{-x}$；
由 $f(0)=0,f'(0)=1$ 得 $C_1=\frac13,\;C_2=-\frac13$：
$$f(x)=\frac{\mathrm e^{2x}-\mathrm e^{-x}}{3},\qquad a_n=f^{(n)}(0)=\frac{2^n-(-1)^n}{3}.$$

[17]
记 $P_0=(\alpha_1,\alpha_2,\alpha_3)$，则 $AP_0=P_0B$，$B=\begin{pmatrix}1&0&0\\1&2&2\\1&1&3\end{pmatrix}$．
（Ⅰ）$|\lambda E-B|=(\lambda-1)^2(\lambda-4)$，故 $A$ 的特征值为 $1,1,4$．
（Ⅱ）$B$ 的特征向量：$\lambda=4$ 取 $(0,1,1)^{\mathrm T}$；$\lambda=1$ 取 $(-1,1,0)^{\mathrm T},(-2,0,1)^{\mathrm T}$．故
$$P=P_0\begin{pmatrix}0&-1&-2\\1&1&0\\1&0&1\end{pmatrix}=(\alpha_2+\alpha_3,\;-\alpha_1+\alpha_2,\;-2\alpha_1+\alpha_3),\qquad \Lambda=\mathrm{diag}(4,1,1),$$
$$|A-2E|=(4-2)(1-2)(1-2)=2 .$$

[18]
$\Omega$ 是球心 $(0,0,1)$、半径 $1$ 的球体．作平移 $z=1+w$，则
$$m=\iiint_\Omega x^2dV=\iiint_{x^2+y^2+w^2\leqslant1}x^2dV=\frac13\iiint\rho^2dV=\frac13\int_0^1\rho^2\cdot4\pi\rho^2d\rho=\frac{4\pi}{15}.$$

[19]
左端 $=\mathrm e^{\lim x^2\ln\cos\frac ax}=\mathrm e^{-\frac{a^2}{2}}$；右端由积分中值定理 $=\lim\limits_{\xi\to\infty}f(\xi)=\frac1{\mathrm e}$．
故 $\frac{a^2}{2}=1$，$a=\sqrt2$．

[20]
在 $\big(\frac12,\frac12\big)$ 处由 $\mathrm e^{z}+z=1$ 得 $z=0$．两边求偏导：
$$\mathrm e^{2yz}\cdot2yz'_x+1+z'_x=0\Rightarrow z'_x=-\frac12;\qquad \mathrm e^{2yz}(2z+2yz'_y)+2y+z'_y=0\Rightarrow z'_y=-\frac12 .$$
故 $\mathrm dz\big|_{(\frac12,\frac12)}=-\dfrac12\mathrm dx-\dfrac12\mathrm dy$．

[21]
$A^4=O$，故
$$(E+A)^{-1}=E-A+A^2-A^3=\begin{pmatrix}1&-1&1&-1\\0&1&-1&1\\0&0&1&-1\\0&0&0&1\end{pmatrix}.$$

[22]
一阶齐次线性方程的解全体为特解的常数倍：$y=C\cos2x$．由 $y(0)=2$ 得 $C=2$．选 **B**．

[23]
区域关于 $x$ 轴对称，$\bar y=0$．
$$S=\int_0^{\frac\pi2}d\theta+\int_{\frac\pi2}^{\pi}(1+\cos\theta)^2d\theta=\frac{5\pi}{4}-2 ,$$
$$\iint x\,d\sigma=\frac23\Big[1+\int_{\frac\pi2}^{\pi}\cos\theta(1+\cos\theta)^3d\theta\Big]=\frac{5\pi}{8}-\frac43 .$$
故形心为 $\Big(\dfrac{15\pi-32}{6(5\pi-8)},\;0\Big)$．

[24]
$$x\mathrm e^x-\mathrm e^x+1=\sum_{n=1}^{\infty}\frac{n-1}{n!}x^n\Longrightarrow f(x)=\sum_{n=0}^{\infty}\frac{n+1}{(n+2)!}x^n\quad(-\infty<x<+\infty).$$
又
$$\sum_{n=1}^{\infty}\frac{n}{(n+1)!}=\sum_{n=1}^{\infty}\Big[\frac{1}{n!}-\frac{1}{(n+1)!}\Big]=1 .$$

[25]
指数分布无记忆性：$P\{X>16\mid X>8\}=P\{X>8\}=\mathrm e^{-8\lambda}$．

[26]
在 $\Sigma$ 上 $x^2+y^2+z^2=2y$，故被积函数 $=2y+y^2+2z^2$．球心 $(0,1,0)$、半径 $1$，
$$\oiint2y\,dS=2\cdot1\cdot4\pi=8\pi,\quad \oiint y^2dS=4\pi+\frac{4\pi}{3}=\frac{16\pi}{3},\quad \oiint z^2dS=\frac{4\pi}{3},$$
$$I=8\pi+\frac{16\pi}{3}+\frac{8\pi}{3}=16\pi .$$

[27]
由题设 $f(1,1)=1$，且 $f$ 在 $(1,1)$ 处的一阶偏导数与 $\mathrm e^{x^2+y^2-2}$ 相同：$f'_1=f'_2=2$．
（Ⅰ）$g'_x=f'_1\mathrm e^{x-y}+f'_2y\big|_{(1,1)}=4$，$g'_y=-f'_1\mathrm e^{x-y}+f'_2x\big|_{(1,1)}=0$，故
$$\mathrm dg\big|_{(1,1)}=4\,\mathrm dx .$$
（Ⅱ）
$$\lim_{t\to0}\frac{g(1+\sin t,1)-g(1,1)}{t}-\lim_{t\to0}\frac{g(1,1-\tan t)-g(1,1)}{t}=g'_x\cdot1-g'_y\cdot(-1)=4 .$$

[28]
$x=(1-\cos\theta)\cos\theta,\;y=(1-\cos\theta)\sin\theta$，在 $\theta=\frac\pi2$ 处点为 $(0,1)$，且
$$\frac{dx}{d\theta}\Big|_{\frac\pi2}=-1,\qquad \frac{dy}{d\theta}\Big|_{\frac\pi2}=1\Longrightarrow k=-1 .$$
切线方程：$y-1=-x$，即 $x+y=1$．

[29]
（Ⅰ）解 $AX=\alpha$ 得
$$X=(1,1,0,0)^{\mathrm T}+t(-1,-2,-1,1)^{\mathrm T}.$$
代入 $B$ 的三行分别得 $1,\;2,\;-1$（与 $t,a$ 无关），故这些 $X$ 都满足 $BX=\beta$．
（Ⅱ）$\mathrm r(A)=3$，解空间维数为 $1$；对 $B$ 作行变换 $r_3+\frac12r_2$ 得末行 $(0,0,a-1,a-1)$，
故 $a\neq1$ 时 $\mathrm r(B)=3$，两方程组解集同为一维，必同解；$a=1$ 时 $\mathrm r(B)=2$，解集为二维，不同解．
故 $a=1$．

[30]
取置换矩阵 $P=(e_2,e_3,e_1)=\begin{pmatrix}0&0&1\\1&0&0\\0&1&0\end{pmatrix}$，则 $P^{\mathrm T}AP=\mathrm{diag}(2,3,1)=B$．选 **B**．

[31]
"矩阵 $(\alpha_1,\cdots,\alpha_k)$ 与 $(\beta_1,\cdots,\beta_k)$ 等价"即二者秩相同，
而 $\mathrm r(\alpha_1,\cdots,\alpha_k)=k$，故等价于 $\mathrm r(\beta_1,\cdots,\beta_k)=k$，即（Ⅱ）线性无关．选 **D**．

[32]
$\frac{\sqrt n\,\overline X}{\sigma}\sim N(0,1)$，$\frac{S_1^2}{\sigma^2}\sim\chi^2(n-1)$ 且二者独立，故
$$\frac{\sqrt n\,\overline X/\sigma}{\sqrt{\frac{S_1^2/\sigma^2}{n-1}}}=\frac{\sqrt{n(n-1)}\,\overline X}{S_1}\sim t(n-1).$$
选 **C**．

[33]
$$(1+x)^{\frac2x}=\mathrm e^{2-x+\frac23x^2+o(x^2)}=\mathrm e^2\Big[1-x+\frac76x^2+o(x^2)\Big],\qquad
\mathrm e^2[1-\ln(1+x)]=\mathrm e^2\Big[1-x+\frac{x^2}{2}+o(x^2)\Big],$$
两者之差 $=\frac23\mathrm e^2x^2+o(x^2)$，是关于 $x$ 的**高阶**无穷小．选 **C**．

[34]
两边求偏导得 $z'_x=\dfrac{x-3y}{y+z},\;z'_y=\dfrac{-3x+10y-z}{y+z}$．
驻点条件 $x=3y,\;z=y$，代入原方程得 $-2y^2+18=0$，$y=\pm3$，故驻点 $(9,3)$（$z=3$）与 $(-9,-3)$（$z=-3$）．
在驻点处
$$A=z''_{xx}=\frac{1}{y+z},\quad B=z''_{xy}=\frac{-3}{y+z},\quad C=z''_{yy}=\frac{10}{y+z},\qquad AC-B^2=\frac{1}{(y+z)^2}>0 .$$
故 $(9,3)$ 处 $A=\frac16>0$，$z$ 取**极小值 $3$**；$(-9,-3)$ 处 $A=-\frac16<0$，$z$ 取**极大值 $-3$**．

[35]
$\mathrm r(B)\geqslant2$ 及 $BA=O$ 给出 $\mathrm r(A)\leqslant3-2=1$，故 $A$ 的各行成比例：
$$(a,1,b)=-(2,-1,3),\quad (4,c,6)=2(2,-1,3)\Longrightarrow a=-2,\;b=-3,\;c=-2 .$$
于是 $A=(1,-1,2)^{\mathrm T}(2,-1,3)$，$(2,-1,3)(1,-1,2)^{\mathrm T}=9$，故
$$A^n=9^{\,n-1}A=9^{\,n-1}\begin{pmatrix}2&-1&3\\-2&1&-3\\4&-2&6\end{pmatrix}.$$

[36]
$y^*=\mathrm e^{-x}+x\mathrm e^{x}$．其中 $\mathrm e^{-x}$ 必为齐次解，$x\mathrm e^x$ 为对应 $c\mathrm e^x$ 的特解且出现共振，
说明特征根为 $-1$ 与 $1$．故通解
$$y=C_1\mathrm e^{-x}+C_2\mathrm e^{x}+x\mathrm e^{x}.$$

[37]
$$a_n=\int_0^{n\pi}|x\sin x|dx=\sum_{k=1}^{n}(2k-1)\pi=\pi n^2 ,$$
$$\sum_{k=1}^{\infty}\frac{1}{\sqrt{a_ka_{k+1}}}=\frac1\pi\sum_{k=1}^{\infty}\frac{1}{k(k+1)}=\frac1\pi .$$
选 **B**．

[38]
$E(X^2)=a_2$，$D(X^2)=a_4-a_2^2$，由中心极限定理
$$Y_n=\frac1n\sum X_i^2\ \text{近似服从}\ N\Big(a_2,\frac{a_4-a_2^2}{n}\Big).$$
选 **A**．

[39]
在 $L$ 上 $x^2+y^2=1$，故 $\mathrm e^{x^2+y^2}=\mathrm e$，且由对称性 $\int_Lxy\,ds=0$，
$$\int_L(x-y)^2\mathrm e^{x^2+y^2}ds=\mathrm e\int_L(1-2xy)ds=\mathrm e\cdot\pi=\pi\mathrm e .$$

[40]
在 $I_1$ 中用 $x\to\pi-x$：被积函数中除 $x$ 外关于 $\frac\pi2$ 对称，故 $I_1=\frac\pi2I_2>I_2$．
又 $I_2=2\displaystyle\int_0^{\frac\pi2}\frac{\sin^2x}{1+\mathrm e^{\cos^2x}}dx\;(\text{令 }x\to\tfrac\pi2-t)\;=\;2I_3>I_3$．
故 $I_1>I_2>I_3$，选 **A**．

[41]
$A=(a-1)E+J$（$J$ 为全 $1$ 矩阵），特征值为 $a-1+n$（单）与 $a-1$（$n-1$ 重）．
（Ⅰ）取
$$P=\big((1,1,\cdots,1)^{\mathrm T},\,(1,-1,0,\cdots,0)^{\mathrm T},\,\cdots,\,(1,0,\cdots,0,-1)^{\mathrm T}\big),$$
则 $P^{-1}AP=\Lambda=\mathrm{diag}(a+n-1,\,a-1,\,\cdots,\,a-1)$．
（Ⅱ）$a\neq1$ 且 $a\neq1-n$ 时 $A$ 可逆，$\mathrm r(A^*)=n$；
$a=1-n$ 时 $\mathrm r(A)=n-1$，$\mathrm r(A^*)=1$；$a=1$ 时 $\mathrm r(A)=1\leqslant n-2$，$\mathrm r(A^*)=0$．

[42]
（Ⅰ）令 $g(x)=f(x)-2(1-x)$，则 $g(0)=-2<0,\;g(1)=1>0$，由介值定理存在 $x_0\in(0,1)$ 使 $f(x_0)=2(1-x_0)$．
（Ⅱ）在 $[0,x_0]$、$[x_0,1]$ 上分别用拉格朗日中值定理：
$$f'(\xi)=\frac{f(x_0)}{x_0}=\frac{2(1-x_0)}{x_0},\qquad f'(\eta)=\frac{1-f(x_0)}{1-x_0}=\frac{2x_0-1}{1-x_0},$$
其中 $\xi\in(0,x_0),\;\eta\in(x_0,1)$，故 $\xi\neq\eta$，且
$$f'(\xi)\big[1+f'(\eta)\big]=\frac{2(1-x_0)}{x_0}\cdot\frac{x_0}{1-x_0}=2 .$$

[43]
偏导数存在且连续 $\Rightarrow$ 可微，与"不可微"矛盾，故 B 一定不成立．选 **B**．

[44]
令 $u=1-x,\;v=1-y$，则 $2x-x^2=1-u^2$，
$$I=\iint_{[0,1]^2}\max\{1-u^2,\,v^2\}du\,dv,\qquad 1-u^2\geqslant v^2\iff u^2+v^2\leqslant1 .$$
记 $Q$ 为四分之一圆盘，则
$$I=\iint_Q(1-u^2)+\Big[\iint_{[0,1]^2}v^2-\iint_Qv^2\Big]=\Big(\frac\pi4-\frac{\pi}{16}\Big)+\Big(\frac13-\frac{\pi}{16}\Big)=\frac{\pi}{8}+\frac13 .$$

[45]
由 $a_{ij}=A_{ij}$ 知 $A^*=A^{\mathrm T}$，故 $AA^{\mathrm T}=AA^*=|A|E$，取行列式得 $|A|^2=|A|^3$，
$|A|=0$ 时由 $AA^{\mathrm T}=O$ 得 $A=O$ 与 $a_{33}\neq0$ 矛盾，故 $|A|=1$，$A$ 为正交矩阵．
而 $b=(a_{13},a_{23},a_{33})^{\mathrm T}$ 恰为 $A$ 的第三列，即 $b=A(0,0,1)^{\mathrm T}$，故方程组有唯一解
$$x=(0,0,1)^{\mathrm T}.$$

[46]
与路径无关 $\iff\frac{\partial}{\partial y}(Fy)=\frac{\partial}{\partial x}(Fx)$，即 $yF'_y=xF'_x$，其通解为 $F=\varphi(xy)$．
故 $F(x,y)=0$ 确定的曲线为 $xy=C$；过 $(1,2)$ 得 $C=2$，即
$$xy=2\qquad\Big(y=\frac2x,\ \text{与坐标轴无交点}\Big).$$

[47]
$$P\{X>1,Y>-1\}=1-P\{X\leqslant1\}-P\{Y\leqslant-1\}+P\{X\leqslant1,Y\leqslant-1\},$$
而 $P\{X\leqslant1\}=\Phi\big(\frac1\sigma\big)$，$P\{Y\leqslant-1\}=1-\Phi\big(\frac1\sigma\big)$，二者之和为 $1$，故
$$P\{X>1,Y>-1\}=\frac14 .$$

[48]
放入的两球中白球数 $W\sim B\big(2,\frac35\big)$，$X=3+W$，
$$EX=3+\frac65=\frac{21}{5},\qquad DX=DW=2\cdot\frac35\cdot\frac25=\frac{12}{25}.$$
选 **B**．

[49]
解方程得 $y=2\mathrm e^x-x-1$，故
$$y\Big(\frac1n\Big)-1-\frac1n=2\Big(\mathrm e^{\frac1n}-1-\frac1n\Big)=\frac{1}{n^2}+O\Big(\frac{1}{n^3}\Big),$$
与 $\sum\frac{1}{n^2}$ 同阶，故级数**（绝对）收敛**．

[50]
由曲率公式 $\frac{|y''|}{(1+y'^2)^{3/2}}=\frac{1}{\sqrt{1+y'^2}}$ 及上凸（$y''<0$）得 $y''=-(1+y'^2)$．
令 $p=y'$：$\arctan p=-x+C$，由 $y'(0)=1$ 得 $C=\frac\pi4$，故 $y'=\tan\big(\frac\pi4-x\big)$，
$$y=\ln\Big|\cos\Big(\frac\pi4-x\Big)\Big|+C_2 ,$$
由 $y(0)=1$ 得曲线
$$y=1+\ln\Big[\sqrt2\cos\Big(x-\frac\pi4\Big)\Big].$$

[51]
由 $A^*=3A^{-1}=-A+4E$ 得 $A^2-4A+3E=O$，即 $(A-E)(A-3E)=O$，特征值只能为 $1,3$；
又 $|A|=3$，故特征值为 $1,1,3$，且 $A$ 可对角化．于是 $2E-A$ 的特征值为 $1,1,-1$，可逆，
从而 $(2E-A)^{\mathrm T}(2E-A)$ 正定，规范形为 $y_1^2+y_2^2+y_3^2$．选 **C**．

[52]
$$a^{\frac1x}-a^{\frac{1}{x+1}}=\mathrm e^{\frac{\ln a}{x}}-\mathrm e^{\frac{\ln a}{x+1}}\sim\ln a\Big(\frac1x-\frac1{x+1}\Big)=\frac{\ln a}{x(x+1)}\sim\frac{\ln a}{x^2},$$
故 $x^P\cdot\frac{\ln a}{x^2}$ 有极限当且仅当 $P\leqslant2$，即 $P\in(-\infty,2]$．

[53]
$f'_x(x_0,y_0)$ 存在说明 $f(x,y_0)$ 在 $x_0$ 处可导，从而在该点连续，$\lim\limits_{x\to x_0}f(x,y_0)=f(x_0,y_0)$ 存在．
A、B 需要更强条件，D 也不必成立（偏导存在只要求在两条直线上有定义）．选 **C**．

[54]
最大值 $\frac{1}{\sqrt{2\pi}\sigma}=\frac{1}{2\sqrt{2\pi}}\Rightarrow\sigma=2$，最大值点 $x=\mu=1$，故
$$P\{X<3\}=\Phi\Big(\frac{3-1}{2}\Big)=\Phi(1).$$

[55]
交线满足 $z^2=x^2+y^2=2x$，投影区域 $D:\;x^2+y^2\leqslant2x$．锥面上 $dS=\sqrt2\,dxdy$，
$$\mu=9\sqrt{2(x^2+y^2)}=9\sqrt2\,r,$$
$$m=\iint_D 9\sqrt2\,r\cdot\sqrt2\,d\sigma=18\int_{-\frac\pi2}^{\frac\pi2}\!\!\int_0^{2\cos\theta}r^2dr\,d\theta=18\cdot\frac{32}{9}=64 .$$

[56]
$f$ 为凹（下凸）函数且 $f(0)=0$，故对 $t\in[0,1]$ 有 $f(tx)\leqslant tf(x)$．于是
$$\int_0^{\frac12}f(x)dx\;\overset{x=u/2}{=}\;\frac12\int_0^1f\Big(\frac u2\Big)du\leqslant\frac12\cdot\frac12\int_0^1f(u)du=\frac14\int_0^1f(x)dx ,$$
即 $4\int_0^{1/2}f\leqslant\int_0^1f$．选 **A**．

[57]
（Ⅰ）中 $\alpha_1-2\alpha_2+\alpha_3=0$，故向量组（Ⅰ）的秩为 $2$，等价要求 $\beta_1,\beta_2$ 线性无关且都属于 $\mathrm{span}\{\alpha_1,\alpha_2\}$．
解 $c_1\alpha_1+c_2\alpha_2=\beta_1$ 得 $c_1=-5,c_2=6$（相容）；解 $c_1\alpha_1+c_2\alpha_2=\beta_2$ 得 $c_1=-2,\;c_2=3$，
于是 $a=c_1+c_2=1,\;b=c_2=3$（此时 $\beta_1,\beta_2$ 确实线性无关）．故 $a=1,\;b=3$．

[58]
（Ⅰ）$P\{X=k\}=(1-p)^{k-1}p\;(k=1,2,\cdots)$．
（Ⅱ）$EX=\frac1p$，令 $\overline X=\frac1p$ 得矩估计 $\hat p=\dfrac{1}{\overline X}$；
似然函数 $L=p^n(1-p)^{\sum x_i-n}$，$\frac{d\ln L}{dp}=\frac np-\frac{\sum x_i-n}{1-p}=0$ 得最大似然估计
$$\hat p=\frac{n}{\sum\limits_{i=1}^nX_i}=\frac{1}{\overline X}.$$

[59]
（Ⅰ）$\frac{1}{n^2-1}=\frac12\big(\frac{1}{n-1}-\frac{1}{n+1}\big)$，利用 $\sum\limits_{m\geqslant1}\frac{(1/2)^m}{m}=\ln2$ 得
$$\sum_{n=2}^{\infty}\frac{1}{(n^2-1)2^n}=\frac12\Big[\frac{\ln2}{2}-\big(2\ln2-\frac54\big)\Big]=\frac58-\frac34\ln2 .$$
（Ⅱ）$\sum\limits_{n=0}^{\infty}\frac{2n+1}{n!}=2\sum\limits_{n\geqslant1}\frac{1}{(n-1)!}+\sum\limits_{n\geqslant0}\frac{1}{n!}=2\mathrm e+\mathrm e=3\mathrm e$．

[60]
$$d=\frac{|2\cdot1-(-1)+5\cdot2-12|}{\sqrt{4+1+25}}=\frac{1}{\sqrt{30}}=\frac{\sqrt{30}}{30}.$$

[61]
由 $(q+p)^n=\sum C_n^kp^kq^{n-k}$ 与 $(q-p)^n=\sum C_n^k(-p)^kq^{n-k}$ 相减得
$$P\{A\ \text{发生奇数次}\}=\frac{1-(1-2p)^n}{2}.$$

[62]
记 $s=x+y$．$[1+s]=1,2,3,4$ 分别对应 $s\in[0,1),[1,2),[2,3),[3,4)$，其在正方形内的面积依次为
$$\frac12,\ \frac32,\ \frac32,\ \frac12 ,$$
故
$$I=1\cdot\frac12+2\cdot\frac32+3\cdot\frac32+4\cdot\frac12=10 .$$

[63]
（原题所求量缺失．）由方程两边对 $x$ 求导：
$$1=\sin^2\frac{\pi(y-x)}{4}\cdot(y'-1)\Longrightarrow y'=1+\csc^2\frac{\pi(y-x)}{4}.$$
又 $x=0$ 时 $y-x=1$，即 $y(0)=1$，此时 $y'(0)=1+\dfrac{1}{\sin^2\frac\pi4}=3$．

[64]
由 $A^2=B^2=E$ 知 $|A|^2=|B|^2=1$，结合 $|A|+|B|=0$ 得 $|A||B|=-1$．又
$$A(A+B)B=A^2B+AB^2=B+A=A+B ,$$
两边取行列式：$|A||A+B||B|=|A+B|$，即 $-|A+B|=|A+B|$，故 $|A+B|=0$，$A+B$ 不可逆．

[65]
取 $x=y=0$ 得 $f(0)=0$；再由定义
$$f'(x)=\lim_{h\to0}\frac{\mathrm e^xf(h)+\mathrm e^hf(x)-f(x)}{h}=\mathrm e^xf'(0)+f(x)=\mathrm e^{x+1}+f(x).$$
解线性方程 $f'-f=\mathrm e\cdot\mathrm e^{x}$：$(f\mathrm e^{-x})'=\mathrm e$，$f=(\mathrm ex+C)\mathrm e^x$，由 $f(0)=0$ 得 $C=0$：
$$f(x)=x\mathrm e^{x+1}.$$

[66]
由 $u=x+y,\;v=x-y$ 得 $\partial_x=\partial_u+\partial_v,\;\partial_y=\partial_u-\partial_v$，从而
$$z_{xx}+2z_{xy}+z_{yy}=4\frac{\partial^2z}{\partial u^2}=0 .$$
又 $xy=\frac{u^2-v^2}{4}$，$w=\frac{u^2-v^2}{4}-z$，故
（Ⅰ）$\dfrac{\partial^2w}{\partial u^2}=\dfrac12$．
（Ⅱ）积分得 $\frac{\partial w}{\partial u}=\frac u2+\varphi(v)$，由 $\frac{\partial w(0,v)}{\partial u}=v\mathrm e^{-v}$ 得 $\varphi(v)=v\mathrm e^{-v}$；
再积分 $w=\frac{u^2}{4}+uv\mathrm e^{-v}+\psi(v)$，由 $w(0,v)=\frac{v^2}{4}$ 得 $\psi(v)=\frac{v^2}{4}$．于是
$$z=xy-w=\frac{u^2-v^2}{4}-\frac{u^2}{4}-uv\mathrm e^{-v}-\frac{v^2}{4}=-\frac{v^2}{2}-uv\mathrm e^{-v},$$
即
$$z(x,y)=-\frac{(x-y)^2}{2}-(x+y)(x-y)\mathrm e^{-(x-y)}.$$

[67]
被积表达式 $=\mathrm d\Big[\frac12\ln(x^2+y^2)\Big]-\frac{x\,dy-y\,dx}{x^2+y^2}$．
补上从 $B(-\pi,-\pi)$ 到 $A(\pi,-\pi)$ 的直线段，所得闭曲线为逆时针且围住原点，故
$$\oint=0-2\pi=-2\pi .$$
而在该直线段上（$y=-\pi,\;dy=0$）
$$\int_{-\pi}^{\pi}\frac{x-\pi}{x^2+\pi^2}dx=0-\pi\cdot\frac{1}{\pi}\Big[\arctan\frac x\pi\Big]_{-\pi}^{\pi}=-\frac\pi2 .$$
故 $I=-2\pi-\Big(-\frac\pi2\Big)=-\dfrac{3\pi}{2}$．

[68]
由 $a_{ij}=A_{ij}$ 得 $A^*=A^{\mathrm T}$，故 $AA^{\mathrm T}=|A|E=E$，$A$ 为正交矩阵．
于是第三行为单位向量：$a_{31}^2+a_{32}^2+a_{33}^2=1$，而 $a_{33}=1$，故 $a_{31}=a_{32}=0$．
由克拉默法则 $x_i=\dfrac{A_{3i}}{|A|}=a_{3i}$，故解为
$$x=(0,0,1)^{\mathrm T}.$$

[69]
A 中 $k=0$ 时不是特征向量；B、C 中 $A(\alpha_1\pm\alpha_2)=\alpha_1\mp\alpha_2$ 与 $\alpha_1\pm\alpha_2$ 不成比例（$\alpha_1,\alpha_2$ 线性无关）．
D：$A^2(\alpha_1+\alpha_2)=\alpha_1+\alpha_2$，且 $\alpha_1+\alpha_2\neq0$，故是 $A^2$ 的特征向量．选 **D**．

[70]
（Ⅰ）逐项求导：
$$y'=\sum_{n\geqslant1}\frac{x^{3n-1}}{(3n-1)!},\qquad y''=\sum_{n\geqslant1}\frac{x^{3n-2}}{(3n-2)!},$$
三者相加恰好取遍所有幂次，故 $y''+y'+y=\sum\limits_{k=0}^{\infty}\frac{x^k}{k!}=\mathrm e^x$．
（Ⅱ）由 $y(0)=1,\;y'(0)=0$ 解该方程：特征根 $\frac{-1\pm\sqrt3\mathrm i}{2}$，特解 $\frac13\mathrm e^x$，
$$y=\mathrm e^{-\frac x2}\Big(C_1\cos\frac{\sqrt3}{2}x+C_2\sin\frac{\sqrt3}{2}x\Big)+\frac{\mathrm e^x}{3},\qquad C_1=\frac23,\;C_2=0 ,$$
故
$$\sum_{n=0}^{\infty}\frac{x^{3n}}{(3n)!}=\frac23\mathrm e^{-\frac x2}\cos\frac{\sqrt3}{2}x+\frac{\mathrm e^{x}}{3}.$$

[71]
$Y$ 的密度为 $f(-y)$ 说明 $Y$ 与 $-X$ 同分布，故 $DY=DX=1$，$\mathrm{Cov}(X,Y)=\rho\sqrt{DXDY}=-\frac12$，
$$D(X-Y)=DX+DY-2\mathrm{Cov}(X,Y)=1+1+1=3 .$$
选 **D**．

[72]
$x\to0$ 时 $|f(x)|=\Big|\frac{(x^3-1)\sin x}{|x|(1+x^2)}\Big|\to1$，有界；
$|x|\to\infty$ 时 $\Big|\frac{x^3-1}{|x|(1+x^2)}\Big|\to1$，而 $|\sin x|\leqslant1$，也有界．
故 $f$ 在 $(-\infty,+\infty)$ 内有界．选 **A**．

[73]
齐次型：令 $u=\frac yx$，$xu'=\tan u$，$\cot u\,du=\frac{dx}{x}$，得 $\sin u=Cx$，即 $\sin\frac yx=Cx$．
由 $y(1)=\frac\pi6$ 得 $C=\frac12$，故特解
$$\sin\frac yx=\frac x2,\qquad\text{即}\qquad y=x\arcsin\frac x2 .$$

[74]
配方：
$$f=x_1^2-x_3^2+4x_1x_2+4x_2x_3=(x_1+2x_2)^2-(2x_2-x_3)^2 .$$
令 $y_1=x_1+2x_2,\;y_2=2x_2-x_3,\;y_3=x_3$，反解得
$$x_1=y_1-y_2-y_3,\quad x_2=\frac{y_2+y_3}{2},\quad x_3=y_3,$$
即 $C=\begin{pmatrix}1&-1&-1\\0&\frac12&\frac12\\0&0&1\end{pmatrix}$．选 **A**．

[75]
法向量 $(2x,4y,6z)\parallel(1,4,6)$ 给出 $y=2x,\;z=2x$；代入曲面方程得 $21x^2=21$，$x=\pm1$，
切点为 $(1,2,2)$ 与 $(-1,-2,-2)$，相应切平面为
$$x+4y+6z=21\qquad\text{与}\qquad x+4y+6z=-21 .$$
