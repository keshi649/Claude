[1]
由 $AA^{\mathrm T}=E$ 及 $|A|=1$，
$$|A-E|=|A-AA^{\mathrm T}|=|A|\,|E-A^{\mathrm T}|=|E-A|=(-1)^{2n+1}|A-E|=-|A-E| ,$$
故 $|A-E|=0$，即 $A-E$ 不可逆．

[2]
$\mathrm r(A)=2$，$AX=0$ 的解为 $k(1,1-a,1)^{\mathrm T}$；$B^{\mathrm T}=\begin{pmatrix}-1&-1&b\\1&1&2\end{pmatrix}$．
（Ⅰ）要求解集真包含，必须 $\dim N(B^{\mathrm T})\geqslant2$，即 $\mathrm r(B^{\mathrm T})=1$，两行成比例给出 $b=-2$；
再由 $(1,1-a,1)$ 满足 $x_1+x_2+2x_3=0$ 得 $1+(1-a)+2=0$，$a=4$．故 $a=4,\;b=-2$．
（Ⅱ）因 $\dim N(A)=1$，有非零公共解当且仅当 $(1,1-a,1)^{\mathrm T}\in N(B^{\mathrm T})$，即
$$-1-(1-a)+b=0,\qquad 1+(1-a)+2=0\Longrightarrow a=4,\;b=-2 ,$$
此时全部非零公共解为 $k(1,-3,1)^{\mathrm T}\;(k\neq0)$．

[3]
（Ⅰ）$A=\begin{pmatrix}a&1&b\\1&a&1\\b&1&a\end{pmatrix}$．由 $\mathrm{tr}A=3a=1+1+4=6$ 得 $a=2$；
由 $|A|=1\cdot1\cdot4=4$ 得 $4+2b-2b^2=4$，$b=0$ 或 $1$；验证只有 $b=1$ 时特征值为 $1,1,4$．
此时 $A=E+J$，$\lambda=4$ 的特征向量 $(1,1,1)^{\mathrm T}$，$\lambda=1$ 的特征子空间为 $x_1+x_2+x_3=0$，
$$Q=\Big(\frac{(1,-1,0)^{\mathrm T}}{\sqrt2},\ \frac{(1,1,-2)^{\mathrm T}}{\sqrt6},\ \frac{(1,1,1)^{\mathrm T}}{\sqrt3}\Big).$$
（Ⅱ）$A^*=4A^{-1}$，其特征值为 $\frac4\lambda$；故 $A+A^*$ 的特征值均为 $\lambda+\frac4\lambda=5$（$\lambda=1$ 或 $4$），即 $A+A^*=5E$．
由 $B^2=5E$ 且 $B$ 正定得 $B=\sqrt5\,E$．

[4]
由递推 $na_n=\big(\frac23-(n-1)\big)a_{n-1}$，令 $f(x)=\sum a_nx^n$，则
$$f'-5=\frac23(f-3)-xf'\Longrightarrow (1+x)f'-\frac23f=3 .$$
积分因子 $(1+x)^{-2/3}$：$\big[(1+x)^{-2/3}f\big]'=3(1+x)^{-5/3}$，
$$f=-\frac92+C(1+x)^{\frac23};\qquad f(0)=3\Rightarrow C=\frac{15}{2}.$$
由二项级数 $(1+x)^{2/3}$ 在 $|x|<1$ 内收敛知原级数收敛，且
$$\sum_{n=0}^{\infty}a_nx^n=\frac{15(1+x)^{\frac23}-9}{2}.$$

[5]
代入 $\xi=x+ay,\;\eta=x+by$ 得
$$(3a^2+4a+1)u_{\xi\xi}+\big[2+4(a+b)+6ab\big]u_{\xi\eta}+(3b^2+4b+1)u_{\eta\eta}=0 .$$
要化为 $u_{\xi\eta}=0$，需 $3a^2+4a+1=0$ 与 $3b^2+4b+1=0$ 且 $a\neq b$，即
$$\{a,b\}=\Big\{-1,\;-\frac13\Big\}$$
（此时交叉项系数 $-\frac43\neq0$）．

[6]
特征根 $-a\pm\sqrt{a^2-b^2}$ 均为负，故 $y,y'\to0\;(x\to+\infty)$．对方程在 $[0,+\infty)$ 上积分：
$$\big[y'\big]_0^{+\infty}+2a\big[y\big]_0^{+\infty}+b^2\int_0^{+\infty}y\,dx=0\Longrightarrow -1-2a+b^2I=0 ,$$
$$\int_0^{+\infty}y(x)dx=\frac{1+2a}{b^2}.$$

[7]
$EX=0$，故用二阶矩：$E(X^2)=2\theta^2$．令 $\frac1n\sum X_i^2=2\theta^2$ 得
$$\hat\theta=\sqrt{\frac{1}{2n}\sum_{i=1}^{n}X_i^2},\qquad E(\hat\theta^2)=\frac{1}{2n}\cdot n\cdot2\theta^2=\theta^2 .$$

[8]
由 $P\{X^2=Y^2\}=1$ 知 $\{X=0\}$ 与 $\{Y=0\}$ 同时发生，故
$$P\{X=0,Y=0\}=\frac13,\quad P\{X=1,Y=-1\}=P\{X=1,Y=1\}=\frac13,$$
其余为 $0$．于是 $EX=\frac23,\;EY=0,\;E(XY)=\frac13(-1)+\frac13(1)=0$，
$$\mathrm{Cov}(X,Y)=0\Longrightarrow \rho_{XY}=0 .$$

[9]
记 $S$ 为 $D$ 内满足 $y^2-x^2>2$ 的面积，则 $I=(4\pi-S)-S=4\pi-2S$．
两曲线交于 $x=\pm1,\;y=\pm\sqrt3$，上半部分面积
$$\int_{-1}^{1}\big[\sqrt{4-x^2}-\sqrt{x^2+2}\big]dx=\frac{2\pi}{3}-2\ln\frac{1+\sqrt3}{\sqrt2},$$
故 $S=\frac{4\pi}{3}-4\ln\frac{1+\sqrt3}{\sqrt2}$，
$$I=4\pi-2S=\frac{4\pi}{3}+4\ln(2+\sqrt3).$$

[10]
$z=4-x-y$，$dS=\sqrt3\,dxdy$，由对称性 $\iint_{x^2+y^2\leqslant1}(x+y)d\sigma=0$，
$$I=\sqrt3\iint_{x^2+y^2\leqslant1}(4-x-y)d\sigma=4\sqrt3\pi .$$

[11]
设该向量在两组基下坐标同为 $x$，则 $(\alpha_1,\alpha_2,\alpha_3)x=(\beta_1,\beta_2,\beta_3)x$，即 $(A-B)x=0$：
$$A-B=\begin{pmatrix}0&-2&-1\\-1&-3&-4\\0&-4&-2\end{pmatrix}\Longrightarrow x=t(5,1,-2)^{\mathrm T}.$$
故该向量为
$$\gamma=5\alpha_1+\alpha_2-2\alpha_3=k(4,5,2)^{\mathrm T}\quad(k\ \text{为任意常数}).$$

[12]
列维—林德伯格定理要求独立**同分布**且方差存在有限．A、B 中同分布但方差未必存在，D 中未必同分布．
C 中同服从指数分布，期望方差都存在．选 **C**．

[13]
设奇数项之和 $A=\sum u_{2n-1}=5$，偶数项之和 $B$．由 $\sum(-1)^{n-1}u_n=A-B=2$ 得 $B=3$，
$$\sum_{n=1}^{\infty}u_n=A+B=8 .$$

[14]
$L$ 的方向 $s=(3,-1,2)$，过点 $(-2,2,-1)$．过 $L$ 且垂直于 $\pi$ 的平面法向量为
$$s\times n_\pi=(3,-1,2)\times(2,3,3)=(-9,-5,11),$$
该平面为 $9x+5y-11z-3=0$．故投影直线为
$$\begin{cases}2x+3y+3z-8=0,\\ 9x+5y-11z-3=0 .\end{cases}$$

[15]
"$(\alpha^{\mathrm T},\beta^{\mathrm T})$ 不能由 $(A^{\mathrm T},B^{\mathrm T})$ 的行向量线性表示"恰说明添加这一行后秩增加 $1$：
$$\mathrm r\begin{pmatrix}A^{\mathrm T}&B^{\mathrm T}\\ \alpha^{\mathrm T}&\beta^{\mathrm T}\end{pmatrix}=\mathrm r(A^{\mathrm T},B^{\mathrm T})+1 .$$
选 **C**．

[16]
$y_1-y_3,\;y_2-y_3$ 是齐次方程的两个线性无关解，故通解为
$$y=y_3+C_1(y_1-y_3)+C_2(y_2-y_3)=C_1y_1+C_2y_2+C_3y_3,\qquad C_1+C_2+C_3=1 .$$
选 **D**．

[17]
设切点 $(x_0,y_0)$，由隐函数求导得切线在两轴上的截距分别为
$$X=\frac{a}{3x_0+y_0},\qquad Y=\frac{a}{x_0+3y_0},$$
$$S=\frac{XY}{2}=\frac{a^2}{2(3x_0+y_0)(x_0+3y_0)}=\frac{a^2}{2(a+8x_0y_0)} .$$
由约束 $3(x_0^2+y_0^2)+2x_0y_0=a\geqslant8x_0y_0$ 知 $x_0y_0\leqslant\frac a8$（$x_0=y_0$ 时取等），故
$$S_{\min}=\frac{a^2}{2\cdot2a}=\frac a4=\frac14\Longrightarrow a=1 .$$

[18]
A、B、C 均为标准结论．D 中 $X_i$ 与 $S^2$ 不独立（$S^2$ 含 $X_i$），故 $\frac{X_i^2}{\sigma^2}+\frac{(n-1)S^2}{\sigma^2}$ 不服从 $\chi^2(n)$．选 **D**．

[19]
对 $y$ 求导得 $f'(x+y)=\dfrac{(x+y)[(x+y)^2+1]}{f(x+y)}$，即 $ff'=t^3+t$，
$$f^2=\frac{t^4}{2}+t^2+C;\qquad f(1)=\sqrt2\Rightarrow C=\frac12 ,$$
故 $f^2=\dfrac{(1+x^2)^2}{2}$，$f(x)=\dfrac{\sqrt2}{2}(1+x^2)$．

[20]
在 $L$ 上 $x^2+y^2=R^2$，且 $\oint(\mathrm e^{x^2}dx-\mathrm e^{y^2}dy)=0$（全微分），故
$$I=\frac{1}{R^2}\oint_L(-x^2y\,dx+xy^2dy).$$
逆时针时由格林公式 $\oint=\iint_D(x^2+y^2)d\sigma=\frac{\pi R^4}{2}$，本题取顺时针，
$$I=-\frac{1}{R^2}\cdot\frac{\pi R^4}{2}=-\frac{\pi R^2}{2}.$$

[21]
$A^{\mathrm T}=-A$ 时 $x^{\mathrm T}Ax=0$，故 $E\pm A$ 均可逆（$(E+A)x=0\Rightarrow|x|^2=0$）．
由分块初等变换：
$$r_1=n+\mathrm r\big(B(E+A)\big)=n+\mathrm r(B),\qquad r_2=n+\mathrm r(AB),\qquad r_3=2n .$$
而 $\mathrm r(AB)\leqslant\mathrm r(B)$，故 $r_3\geqslant r_1\geqslant r_2$．选 **D**．

[22]
由 $y(0)=y'(0)=0$ 及方程得 $y''(0)=\mathrm e^0-2y'(0)-y(0)=1$，故
$$y(x)=\frac{x^2}{2}+o(x^2)\sim\frac{x^2}{2}\sim\ln\sqrt{1+x^2}.$$
选 **D**．

[23]
$V=\frac43\pi r^3$，$\dfrac{dV}{dt}=4\pi r^2\dfrac{dr}{dt}=100$，当 $r=10$ 时
$$\frac{dr}{dt}=\frac{100}{4\pi\cdot100}=\frac{1}{4\pi}\ \mathrm{cm/s}.$$

[24]
实对称矩阵不同特征值的特征向量正交：$\alpha_1\cdot\alpha_2=2+3a-2a=2+a=0\Rightarrow a=-2$，$\alpha_2=(1,-2,-4)^{\mathrm T}$．
$|A|=-2$，$A^*$ 的特征值为 $\frac{|A|}{\lambda}$：对应 $\lambda=1,2,-1$ 分别是 $-2,-1,2$．
故 $(A^*-2E)X=0$ 的解空间是 $A^*$ 的特征值 $2$（即 $A$ 的特征值 $-1$）的特征子空间，
其特征向量 $\alpha_3=\alpha_1\times\alpha_2\parallel(2,-1,1)^{\mathrm T}$，通解为
$$X=k(2,-1,1)^{\mathrm T}.$$

[25]
列和为零即 $(1,1,1)A=0$，由对称性 $A(1,1,1)^{\mathrm T}=0$，故 $0$ 是特征值，结合二重特征值 $1$ 知特征值为 $1,1,0$，$A$ 半正定．
（Ⅰ）$X^{\mathrm T}AX=0\iff AX=0\iff X\in\mathrm{span}\{(1,1,1)^{\mathrm T}\}$，即全部解为
$$X=k(1,1,1)^{\mathrm T}.$$
（Ⅱ）$2E-A$ 的特征值为 $1,1,2$，正定．取正交矩阵
$$Q=\Big(\frac{(1,-1,0)^{\mathrm T}}{\sqrt2},\frac{(1,1,-2)^{\mathrm T}}{\sqrt6},\frac{(1,1,1)^{\mathrm T}}{\sqrt3}\Big),\qquad Q^{\mathrm T}(2E-A)Q=\mathrm{diag}(1,1,2),$$
则 $P=\mathrm{diag}(1,1,\sqrt2)\,Q^{\mathrm T}$ 满足 $P^{\mathrm T}P=2E-A$，即 $X^{\mathrm T}(2E-A)X=\|PX\|^2$．

[26]
（Ⅰ）$S_n\to+\infty$，裂项求和：
$$\sum_{n=1}^{\infty}\Big(\frac{1}{S_n}-\frac{1}{S_{n+1}}\Big)=\frac{1}{S_1}=\frac{1}{u_1}.$$
（Ⅱ）当 $n\geqslant2$ 时
$$\frac{u_n}{S_n^2}\leqslant\frac{u_n}{S_{n-1}S_n}=\frac{S_n-S_{n-1}}{S_{n-1}S_n}=\frac{1}{S_{n-1}}-\frac{1}{S_n},$$
右端级数收敛（裂项），由比较判别法 $\sum\dfrac{u_n}{S_n^2}$ 收敛．

[27]
$f(y)\mathrm e^xdx+f'(y)\mathrm e^xdy=\mathrm d\big[f(y)\mathrm e^x\big]$，而 $O,A$ 两点处 $y=0,\;f(0)=0$，该部分积分为 $0$；又 $\int_L\mathrm dy=0$．故
$$I=-\pi\int_Ly\,dx .$$
补上 $A(-2a,0)$ 到 $O$ 的 $x$ 轴线段构成逆时针闭曲线，$\oint y\,dx=-S$，其中
$$S=\frac12\int_0^{\pi}a^2(1-\cos\theta)^2d\theta=\frac{3\pi a^2}{4},$$
故 $\int_Ly\,dx=-\frac{3\pi a^2}{4}$，$I=\dfrac{3\pi^2a^2}{4}$．

[28]
$f(x)=\frac{1}{\sqrt\pi}\mathrm e^{-(x-1)^2}$，即 $X\sim N\big(1,\frac12\big)$，故
$$E(X^2)=DX+(EX)^2=\frac12+1=\frac32 .$$

[29]
令 $u=1-t$：$f(x)=\int_{1-x}^{1}f(u)du+1$，求导得 $f'(x)=f(1-x)$，再求导 $f''(x)=-f(x)$．
故 $f=C_1\cos x+C_2\sin x$；由 $f(0)=1$ 得 $C_1=1$，由 $f'(0)=f(1)$ 得 $C_2=\dfrac{1+\sin1}{\cos1}$．
$$f(x)=\cos x+\frac{1+\sin1}{\cos1}\sin x .$$

[30]
$$P\{\max\leqslant3\}=P\{X\leqslant3\}P\{Y\leqslant3\}=\frac{15}{16}\cdot\frac{8}{3\mathrm e}=\frac{5}{2\mathrm e},\qquad
P\{\max\leqslant1\}=\frac{5}{16}\cdot\frac{2}{\mathrm e}=\frac{5}{8\mathrm e},$$
$$P\{1<\max\leqslant3\}=\frac{5}{2\mathrm e}-\frac{5}{8\mathrm e}=\frac{15}{8\mathrm e}.$$

[31]
$P\{a<X<b\}=\Phi\big(\frac b\sigma\big)-\Phi\big(\frac a\sigma\big)$．记 $t=\frac1\sigma$，对 $t$ 求导并令其为零：
$$b\varphi(bt)=a\varphi(at)\Longrightarrow \ln\frac ba=\frac{(b^2-a^2)t^2}{2}\Longrightarrow \sigma^2=\frac{1}{t^2}=\frac{b^2-a^2}{2\ln\frac ba}.$$

[32]
作变换 $u=x+y,\;v=\dfrac{x}{x+y}$，则 $x=uv,\;y=u(1-v)$，$|J|=u$，区域变为 $0\leqslant u\leqslant1,\;0\leqslant v\leqslant1$，
$$\iint_D\mathrm e^{\frac{x}{x+y}}d\sigma=\int_0^1\!\!\int_0^1\mathrm e^{v}u\,dv\,du=\frac{\mathrm e-1}{2}.$$

[33]
在曲线上 $x^2+y^2=z$，故 $d^2=x^2+y^2+z^2=z+z^2$，关于 $z\geqslant0$ 单调增．
由 $x+y=4-z$ 及 $(x+y)^2\leqslant2(x^2+y^2)$ 得 $(4-z)^2\leqslant2z$，即 $z^2-10z+16\leqslant0$，$2\leqslant z\leqslant8$．
$z=2$ 时 $x=y=1$，$d_{\min}=\sqrt6$，点 $(1,1,2)$；
$z=8$ 时 $x=y=-2$，$d_{\max}=\sqrt{72}=6\sqrt2$，点 $(-2,-2,8)$．

[34]
直接计算得 $A^2=2A$，故 $A^n=2^{\,n-1}A=2^{\,n-1}\begin{pmatrix}1&0&1\\0&2&0\\1&0&1\end{pmatrix}$．

[35]
分母 $\sim x^4$；分子
$$\mathrm e^{x^2}-\mathrm e^{2-2\cos x}=\mathrm e^{2-2\cos x}\big[\mathrm e^{x^2-2+2\cos x}-1\big]\sim x^2-2+2\cos x=\frac{x^4}{12}+o(x^4),$$
故极限 $=\dfrac{1}{12}$．

[36]
由 $f(tx,ty)=t^2f(x,y)$ 及欧拉定理 $xf'_x+yf'_y=2f$．记 $P=\frac{y}{f},\;Q=-\frac{x}{f}$，则在 $D$ 内
$$\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}=-\frac{f-xf'_x}{f^2}-\frac{f-yf'_y}{f^2}=-\frac{2f-(xf'_x+yf'_y)}{f^2}=0 .$$
$D=\{y>0\}$ 是单连通区域且 $P,Q$ 在其中有连续偏导数，故对任意分段光滑闭曲线积分为零．

[37]
$\alpha_1-\alpha_2=(-1,1,-1)^{\mathrm T}$ 与 $\alpha_1-\alpha_3=(0,1,-2-a)^{\mathrm T}$（$a\neq-1$ 时线性无关）都是 $AX=0$ 的解，
故 $\dim N(A)\geqslant2$，$\mathrm r(A)\leqslant1$，从而 $\mathrm r(A^*)=0$，$A^*=O$．
于是 $A^*X=0$ 的解为全空间，包含 $AX=0$ 的解但二者不同解．选 **C**．

[38]
$$\frac{1}{x(a+x^3)}=\frac1a\Big(\frac1x-\frac{x^2}{a+x^3}\Big),\qquad
\int_1^{+\infty}=\frac{1}{3a}\Big[\ln\frac{x^3}{a+x^3}\Big]_1^{+\infty}=\frac{\ln(a+1)}{3a}.$$
由 $\dfrac{\ln(a+1)}{3a}=\dfrac{\ln2}{3}$ 得 $a+1=2^a$，正根为 $a=1$．

[39]
验证 $\dfrac{\partial P}{\partial y}=\dfrac{\partial Q}{\partial x}=-\dfrac{x}{y^2}\mathrm e^{x/y}$，是全微分方程．由
$$u'_x=1+\mathrm e^{x/y}\Longrightarrow u=x+y\mathrm e^{x/y}+h(y),\qquad u'_y=\mathrm e^{x/y}\Big(1-\frac xy\Big)+h'(y)=Q\Longrightarrow h'=0 ,$$
故通解为 $x+y\mathrm e^{\frac xy}=C$．

[40]
$f'_y=-2y\mathrm e^{-x}=0\Rightarrow y_0=0$；$f'_x=\mathrm e^{-x}(a-ax-b+y^2)=0$ 在 $(-1,0)$ 处给出 $2a-b=0$．
又在该驻点 $f''_{xx}=-a\mathrm e,\;f''_{yy}=-2\mathrm e,\;f''_{xy}=0$，取极大值要求 $f''_{xx}<0$ 且 $AC-B^2>0$，即 $a>0$．
故条件为 $a>0,\;b=2a$（极大值点为 $(-1,0)$）．

[41]
若（Ⅰ）线性相关，则 $\sum c_i\alpha_i=0\Rightarrow\sum c_iA\alpha_i=0$，（Ⅱ）也线性相关；其逆否命题即 C．
A、B、D 均有反例（如 $A=O$）．选 **C**．

[42]
由 $\lim\limits_{x\to0}\frac{f(x)}{x^2}=1$ 知 $f(0)=0$ 且在 $0$ 的去心邻域内 $f(x)>0=f(0)$，故 $f(0)$ 是极小值．
A、B 中 $\frac{f'(x)}{x}$ 的极限未必存在或不存在；C 中 $f''(0)$ 未必存在．选 **D**．

[43]
（Ⅰ）分离变量：$\dfrac{df}{f^2}=-2x\,dx\Rightarrow\dfrac1f=x^2+1$，即 $f(x)=\dfrac{1}{1+x^2}$．
（Ⅱ）$a_n=\displaystyle\int_{-\infty}^{+\infty}\frac{dx}{(1+x^2)^n}\xrightarrow{x=\tan\theta}\int_{-\frac\pi2}^{\frac\pi2}\cos^{2n-2}\theta\,d\theta$，故
$$\frac{a_{n+1}}{a_n}=\frac{2n-1}{2n}.$$
$\sum\frac{2n-1}{2n}x^n$ 的收敛半径为 $1$，端点处通项不趋于 $0$，收敛域 $(-1,1)$；
$$S(x)=\sum_{n=1}^{\infty}\Big(1-\frac{1}{2n}\Big)x^n=\frac{x}{1-x}+\frac12\ln(1-x).$$

[44]
两曲线交于 $x=0,1$，且 $0<x<1$ 时 $x^{3/2}<x$．
$$I_x=\int_0^1\!\!\int_{x^{3/2}}^{x}y^2dy\,dx=\frac13\int_0^1\big(x^3-x^{9/2}\big)dx=\frac{1}{44},$$
$$I_y=\int_0^1x^2\big(x-x^{3/2}\big)dx=\frac14-\frac29=\frac{1}{36}.$$

[45]
展开行列式得
$$f(x_1,x_2)=ax_1^2-2ax_1x_2+(1-a)x_2^2 ,$$
其矩阵为 $\begin{pmatrix}a&-a\\-a&1-a\end{pmatrix}$，正定 $\iff a>0$ 且 $a-2a^2>0\iff0<a<\frac12$．
而 $A$ 正定 $\iff1-a>0$ 且 $a-2a^2>0\iff0<a<\frac12$．二者等价．选 **C**．

[46]
在 $L$ 上 $z=3$ 为常数，$dz=0$，且 $\oint3\,dy=0$，故 $I=\oint_Lx^2y^3dx$．
由格林公式（逆时针）
$$I=-\iint_{x^2+y^2\leqslant1}3x^2y^2\,d\sigma=-3\cdot\frac\pi4\cdot\frac16=-\frac{\pi}{8}.$$

[47]
记 $x=\frac1a\in(0,1)$，
$$\sum_{k=1}^{\infty}kx^k=\frac{x}{(1-x)^2}=\frac{\frac1a}{\big(1-\frac1a\big)^2}=\frac{a}{(a-1)^2}.$$

[48]
相似矩阵行列式相同，故同时可逆或同时不可逆，B 正确．
A 显然错；C 错（特征向量一般不同）；D 错（未必可对角化）．选 **B**．

[49]
弧 $\overset{\frown}{OP}$ 与弦 $\overline{OP}$ 所围面积为
$$\int_0^xy(t)dt-\frac12xy(x)=x^2 .$$
求导得 $y-\frac12(y+xy')=2x$，即 $xy'-y=-4x$，$\Big(\frac yx\Big)'=-\frac4x$，
$$y=-4x\ln x+Cx;\qquad y(1)=1\Rightarrow C=1 .$$
故 $y=x-4x\ln x$（满足 $y''=-\frac4x<0$，向上凸）．

[50]
驻点 $\big(\frac{2a}{3},\frac{2b}{3}\big)$ 处 $f''_{xx}=2a>0,\;f''_{yy}=2b>0,\;f''_{xy}=0$，为极小值点，
$$f\Big(\frac{2a}{3},\frac{2b}{3}\Big)=-\frac{4(a^3+b^3)}{27}=-8\Longrightarrow a^3+b^3=54 .$$
椭圆面积 $\pi ab$ 在约束 $a^3+b^3=54$ 下于 $a=b$ 时最大：$a=b=3$，最大面积 $9\pi$．

[51]
$EX=0,\;EX^2=1$；$EY=1,\;DY=\frac34,\;EY^2=\frac74$．
$$\mathrm{Cov}(XY,X-Y)=E[X^2Y]-E[XY^2]-0=EX^2\cdot EY=1,$$
$$D(XY)=EX^2EY^2=\frac74,\qquad D(X-Y)=DX+DY=\frac74 ,$$
$$\rho=\frac{1}{\sqrt{\frac74\cdot\frac74}}=\frac47 .$$

[52]
由泰勒公式 $f(x)=x+x^2+o(x^2)$，故
$$\lim_{x\to0}\frac{f(x)-x}{x^2}=\frac{f''(0)}{2}=1 .$$

[53]
$F''(x)=f'(x)=0$ 当且仅当 $x=\mu$（正态密度的最大值点），且两侧 $F''$ 变号，
故 $x_0=\mu,\;y_0=F(\mu)=\dfrac12$．

[54]
$$P\{Z>z\}=P\{X>z\}P\{Y>z\}=\mathrm e^{-2\lambda z}\;(z\geqslant0),$$
$$F_Z(z)=\begin{cases}1-\mathrm e^{-2\lambda z},&z\geqslant0,\\0,&z<0 .\end{cases}$$

[55]
系数行列式
$$\begin{vmatrix}1&a&f(a)\\1&b&f(b)\\1&c&f(c)\end{vmatrix}=(b-a)(c-a)\Big[\frac{f(c)-f(a)}{c-a}-\frac{f(b)-f(a)}{b-a}\Big].$$
因 $f''\neq0$，$f$ 严格凸或严格凹，两条弦的斜率不相等，故行列式不为零，方程组有唯一解．
即三个平面交于一点．选 **A**．

[56]
$$\alpha=\tan x(1-\cos x)\sim\frac{x^3}{2},\qquad \beta=\frac{2x^2}{\sqrt{1+x^2}+\sqrt{1-x^2}}\sim x^2,\qquad
\gamma=1-\cos(1-\cos x)\sim\frac{(1-\cos x)^2}{2}\sim\frac{x^4}{8}.$$
阶数由低到高：$\beta(2\ \text{阶}),\ \alpha(3\ \text{阶}),\ \gamma(4\ \text{阶})$．选 **D**．

[57]
锥面上 $z^2=x^2+y^2$，$dS=\sqrt2\,dxdy$，投影区域 $D:x^2+y^2\leqslant2ax$．被积函数化为
$$x^2y+y(x^2+y^2)+(x^2+y^2)x ,$$
其中含 $y$ 的奇次项因 $D$ 关于 $x$ 轴对称而积分为零，故
$$I=\sqrt2\iint_Dx(x^2+y^2)d\sigma=\sqrt2\int_{-\frac\pi2}^{\frac\pi2}\cos\theta\int_0^{2a\cos\theta}r^4dr\,d\theta
=\sqrt2\cdot\frac{32a^5}{5}\cdot\frac{5\pi}{16}=2\sqrt2\pi a^5 .$$

[58]
$A$ 可逆时：$(A^*)^{-1}=\frac{A}{|A|}=(A^{-1})^*$，①正确；$(kA)^*=k^{n-1}A^*$，②正确；
$(A^*)^{\mathrm T}=(A^{\mathrm T})^*$，③正确；$(A^*)^*=|A|^{n-2}A$，④正确．选 **D**．

[59]
（Ⅰ）幂级数 $\sum(-1)^{n-1}a_nx^n$ 在 $x=\mathrm e$ 处收敛，故收敛半径 $R\geqslant\mathrm e>1$，在 $x=1$ 处**绝对收敛**，
即 $\sum a_n$ 绝对收敛．
（Ⅱ）$\frac{1}{\ln(1+n)}\downarrow0$，由莱布尼茨判别法收敛；而 $\sum\frac{1}{\ln(1+n)}>\sum\frac1n$ 发散，故**条件收敛**．
（Ⅲ）$\frac{1}{\sqrt n-\ln n}\downarrow0$，收敛；$\frac{1}{\sqrt n-\ln n}\sim\frac{1}{\sqrt n}$，$\sum\frac{1}{\sqrt n}$ 发散，故**条件收敛**．
（Ⅳ）$\sqrt[n]3-1\sim\frac{\ln3}{n}\downarrow0$，收敛；绝对值级数与 $\sum\frac1n$ 同阶发散，故**条件收敛**．

[60]
$r\parallel a\times b=(-7,-5,-1)$，设 $r=t(-7,-5,-1)$．由 $\mathrm{Prj}_cr=\dfrac{r\cdot c}{|c|}=\dfrac{-21t}{3}=-7t=14$ 得 $t=-2$，
$$r=(14,10,2).$$

[61]
$P(\overline A\mid\overline B)=1-P(A\mid\overline B)$，故条件即 $P(A\mid B)=P(A\mid\overline B)$，即
$$\frac{P(AB)}{P(B)}=\frac{P(A)-P(AB)}{1-P(B)}\Longrightarrow P(AB)=P(A)P(B),$$
即 $A$ 与 $B$ 相互独立．选 **B**．

[62]
由 $f'=g,\;g'=1-f$ 得 $f''+f=1$，且 $f(0)=1,\;f'(0)=g(0)=1$，解得
$$f(x)=1+\sin x,\qquad g(x)=\cos x .$$
$$I=\int_0^{\frac\pi2}\mathrm e^{-x}\big[\cos x-1-\sin x\big]dx=\Big[\mathrm e^{-x}\sin x+\mathrm e^{-x}\Big]_0^{\frac\pi2}=2\mathrm e^{-\frac\pi2}-1 .$$

[63]
两球面交于 $z=\frac R2$．用截面法：
$$I=\int_0^{\frac R2}\pi z^2(2Rz-z^2)dz+\int_{\frac R2}^{R}\pi z^2(R^2-z^2)dz=\frac{\pi R^5}{40}+\frac{47\pi R^5}{480}=\frac{59\pi R^5}{480}.$$

[64]
$Ax=0$ 与 $Bx=0$ 同解 $\iff$ 二者解空间相同 $\iff A,B$ 的行空间相同 $\iff A,B$ 的行向量组等价．选 **B**．

[65]
在等式两边除以 $y$ 并令 $y\to0$ 得 $f'(x)=f(x)-1$，即 $f'-f=-1$，
$$f(x)=C\mathrm e^x+1;\qquad f(0)=2\Rightarrow C=1 ,$$
故 $f(x)=\mathrm e^x+1$．

[66]
记 $Z_i=X_{2i}-X_{2i-1}$，则 $EZ_i=0,\;DZ_i=\frac12$，$D\big(\sum_{i=1}^nZ_i\big)=\frac n2$．
由中心极限定理，$\dfrac{\sum Z_i}{\sqrt{n/2}}$ 近似 $N(0,1)$，故 $k\cdot\dfrac{1}{\sqrt n}=\dfrac{1}{\sqrt{n/2}}$，即 $k=\sqrt2$．

[67]
球面上 $x^2+y^2+z^2=1$，且单位外法向为 $(x,y,z)$，故 $dydz=x\,dS,\;dxdy=z\,dS$：
$$I=\iint_\Sigma(x^2+z^2)dS .$$
$\Sigma$ 的三条边分别在平面 $z=0$、$y=0$、$x=z$ 上，即 $\Sigma=\{y\geqslant0,\;z\geqslant0,\;x\geqslant z\}$．
作绕 $y$ 轴的 $45^\circ$ 旋转 $x'=\frac{x+z}{\sqrt2},\;z'=\frac{z-x}{\sqrt2}$，则 $x^2+z^2=x'^2+z'^2=1-y^2$，
区域变为 $\{y\geqslant0\}\cap\{-\frac\pi4\leqslant\psi\leqslant0\}$（$\psi$ 为绕 $y$ 轴的方位角）．取 $y=\sin\beta$，$dS=\cos\beta\,d\beta\,d\psi$：
$$I=\int_{-\frac\pi4}^{0}\!\!\int_0^{\frac\pi2}\cos^2\beta\cdot\cos\beta\,d\beta\,d\psi=\frac\pi4\cdot\frac23=\frac{\pi}{6}.$$

[68]
当 $t\to0$ 时 $\tan t\sim t,\;\ln(1+t)\sim t$，故
$$z=\frac{2\tan t\,|\ln(1+t)|}{\sqrt{\tan^2t+\ln^2(1+t)}}\sim\frac{2t|t|}{\sqrt2|t|}=\sqrt2\,t ,$$
$$\frac{dz}{dt}\Big|_{t=0}=\lim_{t\to0}\frac{z-0}{t}=\sqrt2 .$$
选 **D**．

[69]
$A=(2-a)E+aJ$，特征值为 $2+2a$（对应 $(1,1,1)^{\mathrm T}$）与 $2-a$（二重，对应 $x_1+x_2+x_3=0$）．
（Ⅰ）取
$$Q=\Big(\frac{(1,1,1)^{\mathrm T}}{\sqrt3},\frac{(1,-1,0)^{\mathrm T}}{\sqrt2},\frac{(1,1,-2)^{\mathrm T}}{\sqrt6}\Big),\qquad
f=(2+2a)y_1^2+(2-a)(y_2^2+y_3^2).$$
（Ⅱ）$f=\|PX\|^2=X^{\mathrm T}P^{\mathrm T}PX$ 且 $P$ 可逆要求 $A$ 正定，即 $2-a>0$，正整数 $a$ 只能取 $a=1$．
此时 $A$ 的特征值为 $4,1,1$，取
$$P=\mathrm{diag}(2,1,1)\,Q^{\mathrm T}=\begin{pmatrix}\frac{2}{\sqrt3}&\frac{2}{\sqrt3}&\frac{2}{\sqrt3}\\[2pt]\frac{1}{\sqrt2}&-\frac{1}{\sqrt2}&0\\[2pt]\frac{1}{\sqrt6}&\frac{1}{\sqrt6}&-\frac{2}{\sqrt6}\end{pmatrix},\qquad P^{\mathrm T}P=A .$$

[70]
令 $u=\mathrm e^{f}$，方程化为 $u'-u=x-1$，解得 $u=C\mathrm e^x-x$；由 $f(0)=0$ 得 $C=1$，
$$f(x)=\ln(\mathrm e^x-x).$$
（Ⅰ）当 $t>0$ 时 $0<\ln(\mathrm e^t-t)<t$，故 $\{a_n\}$ 单调减且有下界 $0$，极限 $L$ 存在；
由 $L=\ln(\mathrm e^L-L)$ 得 $L=0$．
（Ⅱ）由 $\mathrm e^{a_{n+1}}=\mathrm e^{a_n}-a_n$ 得 $a_n=\mathrm e^{a_n}-\mathrm e^{a_{n+1}}$，故部分和
$$\sum_{n=1}^{N}a_n=\mathrm e^{a_1}-\mathrm e^{a_{N+1}}\to\mathrm e-1 ,$$
即 $\sum a_n=\mathrm e-1$．又 $a_{n+1}\sim\frac{a_n^2}{2}$，$a_n\to0$ 极快，$\sqrt[n]{a_n}\to0$，
故幂级数 $\sum a_nx^n$ 的收敛域为 $(-\infty,+\infty)$．

[71]
分母 $\sim\frac{x^3}{2}$；分子中内层 $\int_0^{u^2}\arctan(1+t)dt\sim\frac\pi4u^2$，故分子 $\sim\frac{\pi}{12}x^3$，
$$\text{原式}=\frac{\pi/12}{1/2}=\frac\pi6 .$$

[72]
（Ⅰ）$A$ 的特征值为 $a+1,\;a-1,\;-a$；$B$ 的特征值为 $0,\;-2,\;a^2$．由 $\mathrm{tr}A=\mathrm{tr}B$ 得 $a=a^2-2$，
$a=2$ 或 $-1$；验证只有 $a=-1$ 时两组特征值相同（均为 $0,-2,1$）．故 $a=-1$．
（Ⅱ）此时 $A=\begin{pmatrix}-1&0&1\\0&1&0\\1&0&-1\end{pmatrix}$，交换第 $2,3$ 个坐标即得 $B$，故取
$$Q=\begin{pmatrix}1&0&0\\0&0&1\\0&1&0\end{pmatrix}\quad(\text{正交}),\qquad Q^{-1}AQ=Q^{\mathrm T}AQ=B .$$
（Ⅲ）$M=AB=\begin{pmatrix}1&-1&1\\1&-1&0\\-1&1&-1\end{pmatrix}$ 满足 $M^3+M^2+M=O$，故 $M^4=M$．
取 $P=-M^2$，则 $P^2=M^4=M=AB$，即
$$P=\begin{pmatrix}1&-1&0\\0&0&-1\\-1&1&0\end{pmatrix}.$$

[73]
解方程：$(f\mathrm e^x)'=1\Rightarrow f(x)=x\mathrm e^{-x}$（由 $f(0)=0$）．
（Ⅰ）$f'=(1-x)\mathrm e^{-x}$，$x=1$ 处由正变负，取**极大值** $f(1)=\frac1{\mathrm e}$（无极小值）；
$f''=(x-2)\mathrm e^{-x}$ 在 $x=2$ 处变号，**拐点** $\big(2,\frac{2}{\mathrm e^2}\big)$．
（Ⅱ）令 $g(x)=f(x)-f(2-x)\;(0<x<1)$，则
$$g'(x)=(1-x)\big[\mathrm e^{-x}-\mathrm e^{x-2}\big]>0\quad(0<x<1),\qquad g(1)=0 ,$$
故 $g(x)<0$，即 $f(x_1)<f(2-x_1)$．又 $f(x_1)=f(x_2)$，而 $x_2,\,2-x_1$ 都在 $f$ 严格减少的区间 $(1,+\infty)$ 上，
由 $f(x_2)<f(2-x_1)$ 得 $x_2>2-x_1$，即 $x_1+x_2>2$．

[74]
（Ⅰ）$f$ 为偶函数，$EX=0$；$DX=EX^2=\int_0^{+\infty}x^2\mathrm e^{-x}dx=2$．
（Ⅱ）$X|X|$ 为奇函数，$E(X|X|)=0$，故
$$\mathrm{Cov}(X,|X|)=E(X|X|)-EX\cdot E|X|=0 ,$$
即 $X$ 与 $|X|$ **不相关**．
（Ⅲ）不独立：例如 $P\{|X|<1,X<-1\}=0$，而 $P\{|X|<1\}P\{X<-1\}>0$．

[75]
在曲线上 $x^2+y^2=z$，故 $d^2=x^2+y^2+z^2=z+z^2$；由 $x+y=1-z$ 及 $(x+y)^2\leqslant2(x^2+y^2)$ 得
$$(1-z)^2\leqslant2z\Longrightarrow z^2-4z+1\leqslant0\Longrightarrow 2-\sqrt3\leqslant z\leqslant2+\sqrt3 .$$
$d^2=z^2+z$ 单调增，故 $d^2_{\min}=9-5\sqrt3$，$d^2_{\max}=9+5\sqrt3$．引力大小 $F=\dfrac{1}{d^2}$，
$$F_{\max}=\frac{1}{9-5\sqrt3}=\frac{9+5\sqrt3}{6},\qquad F_{\min}=\frac{1}{9+5\sqrt3}=\frac{9-5\sqrt3}{6}.$$
