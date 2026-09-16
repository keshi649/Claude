[1]
A：取 $M=\frac{1+a}{2}>1$ 即可，正确．B：取 $\varepsilon=\frac{b-a}{2}$，正确．C：极限保序性，正确．D：反例 $a_n=a-\frac1n$，此时 $a_n>a-\frac1n$ 不成立．故错误的是 **D**．

[2]
由通解知 $\mathrm r(A)=3-1=2$，且
$$\alpha_1+2\alpha_2-\alpha_3=\beta,\qquad \alpha_1-2\alpha_2+3\alpha_3=0 .$$
于是 $\beta+\alpha_3=\alpha_1+2\alpha_2$，故 $\mathrm r(B)=\mathrm r(\alpha_1,\alpha_2,\alpha_3)=2$，$By=0$ 的基础解系含 $4-2=2$ 个向量．
设 $y=(y_1,y_2,y_3,y_4)^{\mathrm T}$，则
$$(y_1+y_4)\alpha_1+(y_2+2y_4)\alpha_2+y_3\alpha_3=0\Longrightarrow (y_1+y_4,\;y_2+2y_4,\;y_3)=t(1,-2,3),$$
取 $t=1,y_4=0$ 与 $t=0,y_4=1$ 得基础解系 $(1,-2,3,0)^{\mathrm T},\;(-1,-2,0,1)^{\mathrm T}$．
又 $\alpha_1-\alpha_2$ 显然由 $y=(1,-1,0,0)^{\mathrm T}$ 给出特解，故
$$y=(1,-1,0,0)^{\mathrm T}+k_1(1,-2,3,0)^{\mathrm T}+k_2(-1,-2,0,1)^{\mathrm T}.$$

[3]
记 $P=\frac{-y}{x^2+y^2},Q=\frac{x}{x^2+y^2}$，除原点外 $\frac{\partial Q}{\partial x}=\frac{\partial P}{\partial y}$．
（Ⅰ）圆 $(x+2)^2+(y-2)^2=1$ 不含原点，由格林公式 $I=0$．
（Ⅲ）椭圆内含原点，取小圆 $x^2+y^2=\varepsilon^2$ 挖去，得
$$I=\oint_{x^2+y^2=\varepsilon^2}\frac{x\,dy-y\,dx}{\varepsilon^2}=\frac{1}{\varepsilon^2}\cdot 2\cdot\pi\varepsilon^2=2\pi .$$

[4]
由 $(E-A)(E+A+\cdots+A^{n-1})=E-A^n=E$ 得
$$(E-A)^{-1}=E+A+A^2+\cdots+A^{n-1}.$$

[5]
（Ⅰ）$r^2=2\cos 2\theta$ 的区域关于 $x$ 轴对称，而 $xy$ 关于 $y$ 为奇函数，故 $I=0$．
（Ⅱ）$r^2=2\sin2\theta$，两叶分别在一、三象限，关于原点对称，$xy$ 在此变换下不变，故
$$I=2\int_0^{\frac\pi2}\!\!\int_0^{\sqrt{2\sin2\theta}}r^3\sin\theta\cos\theta\,dr\,d\theta
=2\int_0^{\frac\pi2}\frac{\sin2\theta}{2}\cdot\frac{(2\sin 2\theta)^2}{4}d\theta=\int_0^{\frac\pi2}\sin^3 2\theta\,d\theta=\frac23 .$$

[6]
记 $A=\int_0^{\frac12}f(x)dx$，则 $f(x)=\frac{1}{(1+x)^2}-2A$，两边在 $[0,\frac12]$ 上积分：
$$A=\Big[-\frac{1}{1+x}\Big]_0^{\frac12}-A=\frac13-A\Longrightarrow A=\frac16,\qquad f(x)=\frac{1}{(1+x)^2}-\frac13 .$$
由 $\frac{1}{(1+x)^2}=\sum_{n=0}^{\infty}(-1)^n(n+1)x^n\;(|x|<1)$ 得
$$f(x)=\frac23+\sum_{n=1}^{\infty}(-1)^n(n+1)x^n,\qquad -1<x<1 .$$

[7]
$X$ 服从柯西分布，$F_X(x)=\frac12+\frac1\pi\arctan x$．由 $Y=1-\sqrt[3]{X}$ 单调减，
$$F_Y(y)=P\{X\geqslant (1-y)^3\}=1-F_X\big((1-y)^3\big)=\frac12-\frac1\pi\arctan(1-y)^3 ,$$
$$f_Y(y)=\frac{3(1-y)^2}{\pi\big[1+(1-y)^6\big]},\qquad -\infty<y<+\infty .$$

[8]
令 $u=\frac yx$，则 $g_x=-\frac{y}{x^2}f'$，$g_{xx}=\frac{y^2}{x^4}f''+\frac{2y}{x^3}f'$，$g_{xy}=-\frac{y}{x^3}f''-\frac{1}{x^2}f'$，$g_{yy}=\frac{1}{x^2}f''$．代入得
$$x^3g_{xx}+x^2yg_{xy}+xy^2g_{yy}=\frac{y^2}{x}f''+yf'=y\Longrightarrow uf''(u)+f'(u)=1 .$$
即 $(uf')'=1$，$uf'=u+C$，$f'(u)=1+\frac Cu$，$f(u)=u+C\ln u+D$．
由 $g(y,y)=f(1)=1$ 得 $D=0$；由 $\frac{\partial g}{\partial y}\big|_{(y,y)}=\frac{f'(1)}{y}=\frac2y$ 得 $f'(1)=2$，$C=1$．故
$$f(t)=t+\ln t .$$

[9]
$EX=DX=1$．
$$DY_i=D\Big[\Big(1-\frac1n\Big)X_i-\frac1n\sum_{j\neq i}X_j\Big]=\Big(1-\frac1n\Big)^2+\frac{n-1}{n^2}=1-\frac1n,$$
$T=(n-1)S^2$，$ET=(n-1)DX=n-1$．选 **B**．

[10]
①错：取 $f(a+t)-f(a)=|t|^{2/3}$，则 $\frac{f(a+x^3)-f(a)}{x^2}\equiv 1$ 极限存在，但 $f'(a)$ 不存在．
②错：数列极限存在不能推出函数极限存在，取 $f$ 在 $x=\frac1n$ 及 $0$ 处取 $0$、其余取 $1$，则该极限为 $0$，但 $f$ 在 $a=0$ 处不连续．
③对：$f'(a)=\lim\limits_{x\to a}\frac{(x-a)\varphi(x)}{x-a}=\varphi(a)$．
故仅 ③ 正确（原书选项缺失，按“仅③正确”作答）．

[11]
设 $s=x+y,\;p=xy$，由 $x^2+y^2+xy=3$ 得 $p=s^2-3$，$x^2+y^2=6-s^2$，于是
$$f=(1+x)^2+(1+y)^2=x^2+y^2+2s+2=8+2s-s^2=9-(s-1)^2 .$$
$x,y$ 为实数要求 $s^2\geqslant 4p$，即 $s^2\leqslant 4$，$s\in[-2,2]$．取 $s=1$ 得最大值
$$f_{\max}=9\qquad(\text{此时 }x=2,y=-1\text{ 或 }x=-1,y=2).$$

[12]
（Ⅰ）似然函数 $L=\theta^{-n}\;(0\leqslant x_{(n)}\leqslant\theta)$ 关于 $\theta$ 单调减，故 $\hat\theta=X_{(n)}=\max\{X_1,\cdots,X_n\}$．
（Ⅱ）$X_{(n)}$ 的密度为 $\frac{n x^{n-1}}{\theta^n}\;(0\leqslant x\leqslant\theta)$，故
$$E\hat\theta=\frac{n}{n+1}\theta,\qquad E\hat\theta^2=\frac{n}{n+2}\theta^2,\qquad D\hat\theta=\frac{n\theta^2}{(n+2)(n+1)^2}.$$

[13]
在 $L$ 上 $x^2+y^2=2x$，$z^2=x^2+y^2=2x$，$y^2=2x-x^2$，且 $z=\sqrt{2x}$，$dz=\frac{dx}{z}$，于是
$$(y^2+z^2)dx+(x^2+y^2)dz=(4x-x^2)dx+\sqrt{2x}\,dx$$
为只含 $x$ 的全微分，沿闭曲线积分为 $0$．故
由格林公式
$$I=\oint_L (2x-x^2)\,dy=\iint_{x^2+y^2\leqslant 2x}(2-2x)\,d\sigma=2\pi-2\pi=0 .$$

[14]
（Ⅰ）$f_X(x)=\int_x^{+\infty}x\mathrm e^{-y}dy=x\mathrm e^{-x}\;(x>0)$，$f_Y(y)=\int_0^{y}x\mathrm e^{-y}dx=\frac{y^2}{2}\mathrm e^{-y}\;(y>0)$．
因 $f(x,y)\neq f_X(x)f_Y(y)$，故 $X,Y$ **不独立**．
（Ⅱ）当 $0<x\leqslant y$ 时 $F(x,y)=1-(1+x)\mathrm e^{-x}-\frac{x^2}{2}\mathrm e^{-y}$；
当 $0<y<x$ 时 $F(x,y)=1-\big(1+y+\frac{y^2}{2}\big)\mathrm e^{-y}$；其余为 $0$．
（Ⅲ）$f_Z(z)=\int_0^{z/2}x\mathrm e^{-(z-x)}dx=\Big(\frac z2-1\Big)\mathrm e^{-z/2}+\mathrm e^{-z}\;(z>0)$，其余为 $0$．

[15]
被积函数 $=\frac{(a-b)x+b}{x(2x+b)}=\frac1x+\frac{a-b-2}{2x+b}$．积分收敛要求 $1+\frac{a-b-2}{2}=0$，即 $a=b$．此时
$$\int_1^{+\infty}\Big(\frac1x-\frac{2}{2x+b}\Big)dx=\Big[\ln\frac{x}{2x+b}\Big]_1^{+\infty}=\ln\frac{2+b}{2}=1\Longrightarrow b=2(\mathrm e-1)=a .$$
选 **B**．

[16]
（Ⅰ）$|\lambda E-A|=\lambda(\lambda-1)\big(\lambda-(2+a^2)\big)$，特征值 $0,1,2+a^2$．$A-kE$ 半负定 $\iff k\geqslant\lambda_{\max}$，故 $k_{\min}=2+a^2$．
（Ⅱ）配方：
$$f=x_1^2+(1+a^2)x_2^2+x_3^2-2x_1x_2+2ax_2x_3=(x_1-x_2)^2+(ax_2+x_3)^2,$$
而 $g=(y_1-y_2)^2+y_3^2$．取 $x_1-x_2=y_1-y_2,\;x_2=y_2,\;ax_2+x_3=y_3$，即
$$C=\begin{pmatrix}1&0&0\\0&1&0\\0&-a&1\end{pmatrix}\quad(|C|=1\neq0),$$
则 $X=CY$ 将 $f$ 化为 $g$．

[17]
由 $AB=E_m$ 知 $\mathrm r(A)=\mathrm r(B)=m$．$A$ 为 $m\times n$ 行满秩，故 $AX=\alpha$ 必有解（未必唯一）；$B$ 为 $n\times m$ 列满秩，故 $BX=0$ 只有零解（而 $BX=\beta$ 未必有解）．选 **D**．

[18]
$$\sqrt[3]{1-x^6}=-x^2\Big(1-\frac{1}{x^6}\Big)^{1/3}=-x^2+\frac{1}{3x^4}+o(x^{-4}),$$
故 $a=-1,\;b=0$．

[19]
$\rho=0$ 故 $X,Y$ 独立，$EX=EY=1$，$EX^2=2+1=3$，$EY^2=4+1=5$．
$$D(XY)=E(X^2Y^2)-(EXEY)^2=3\times5-1=14 .$$

[20]
（Ⅰ）收敛域 $[-2,2)$，$S(x)=-\dfrac{\ln(1-\frac x2)}{x}\;(x\neq0)$，$S(0)=\frac12$．
（Ⅱ）收敛域 $(-1,1)$．由 $\frac{(n-1)^2}{n+1}=n-3+\frac{4}{n+1}$ 得
$$S(x)=\frac{x}{(1-x)^2}-\frac{3}{1-x}-\frac{4\ln(1-x)}{x}\;(x\neq0),\qquad S(0)=1 .$$
（Ⅲ）收敛域 $(-\infty,+\infty)$．由 $n^2+1=n(n-1)+n+1$ 得 $S(x)=(x^2+x+1)\mathrm e^{x}$．
（Ⅳ）收敛域 $(-\infty,+\infty)$．由 $2(n+1)=(2n+3)-1$ 得
$$x^3S(x)=\frac12\big[x(1-\cos x)-(x-\sin x)\big]=\frac{\sin x-x\cos x}{2},\quad S(x)=\frac{\sin x-x\cos x}{2x^3}\;(x\neq0),\;S(0)=\frac16 .$$

[21]
伯努利方程．令 $z=y^{-1}$，得 $z'+\frac6xz=x$，积分因子 $x^6$：$(x^6z)'=x^7$，$z=\frac{x^2}{8}+\frac{C}{x^6}$．故
$$\frac1y=\frac{x^2}{8}+\frac{C}{x^6},\qquad\text{即}\qquad y=\frac{8x^6}{x^8+C_1}\;(C_1=8C).$$

[22]
$|B|=-|A|=-2$，而
$$|B^{-1}B^{*}B^{\mathrm T}|=\frac{1}{|B|}\cdot|B|^{\,n-1}\cdot|B|=|B|^{\,n-1}=(-2)^{n-1}.$$

[23]
$\mathrm r(A)=1$ 知 $\lambda=0$ 是二重特征值，$AX=0$ 的解空间即 $\lambda=0$ 的特征子空间，与 $\alpha=(-1,1,1)^{\mathrm T}$ 正交．验证 $(1,1,0),(1,0,1)$ 均与 $\alpha$ 正交且线性无关．选 **B**．

[24]
设最小值点为 $c\in(0,1)$，则 $f'(c)=0$ 且 $f(c)\leqslant f(0)=0$．
（Ⅰ）当 $f(c)=f(0)=0$ 时，由罗尔定理存在 $\xi_1\in(0,c)$ 使 $f'(\xi_1)=0$；再对 $f'$ 在 $[\xi_1,c]$ 上用罗尔定理得 $\xi\in(\xi_1,c)\subset(0,1)$ 使 $f''(\xi)=0$．
（Ⅱ）令 $F(x)=\mathrm e^{-\lambda x}f'(x)$，则 $F(\xi_1)=F(c)=0$，由罗尔定理存在 $\eta\in(\xi_1,c)$ 使
$$F'(\eta)=\mathrm e^{-\lambda\eta}\big[f''(\eta)-\lambda f'(\eta)\big]=0\Longrightarrow f''(\eta)-\lambda f'(\eta)=0 .$$
注：若最小值 $f(c)<f(0)$，结论（Ⅰ）不成立（反例 $f(x)=2(x-\frac14)^2-\frac18$ 满足 $f(0)=0,f(1)=1$ 而 $f''\equiv4$），故本题应按“最小值 $=f(0)=0$”理解，题干请核对．

[25]
两边分别对 $x$、$y$ 求偏导：
$$\Big(1+\frac1z\Big)z_x=\mathrm e^{-x^2},\qquad \Big(1+\frac1z\Big)z_y=-\mathrm e^{-y^2}\Longrightarrow z_x=\frac{z\mathrm e^{-x^2}}{1+z},\quad z_y=-\frac{z\mathrm e^{-y^2}}{1+z}.$$
故
$$\frac{\partial^2z}{\partial x\partial y}=\mathrm e^{-x^2}\frac{\partial}{\partial y}\Big(\frac{z}{1+z}\Big)=\frac{\mathrm e^{-x^2}z_y}{(1+z)^2}=-\frac{z\,\mathrm e^{-x^2-y^2}}{(1+z)^3}.$$

[26]
$F_X(x)=x^3\;(0<x<1)$．当 $y>1$ 时
$$F_Y(y)=P\Big\{X\geqslant\frac1y\Big\}=1-\frac{1}{y^3},$$
$y\leqslant1$ 时 $F_Y(y)=0$．故 $f_Y(y)=\dfrac{3}{y^4}\;(y>1)$，其余为 $0$．

[27]
极坐标：$0\leqslant\theta\leqslant\frac\pi4$，$0\leqslant r\leqslant\sqrt2\cos\theta$，且此时 $\sqrt2\cos\theta\geqslant1$．
$$\int_0^1(1-r)r\,dr+\int_1^{a}(r-1)r\,dr=\frac{a^3}{3}-\frac{a^2}{2}+\frac13,\qquad a=\sqrt2\cos\theta .$$
于是
$$I=\int_0^{\frac\pi4}\Big(\frac{2\sqrt2}{3}\cos^3\theta-\cos^2\theta+\frac13\Big)d\theta=\frac{2\sqrt2}{3}\cdot\frac{5\sqrt2}{12}-\Big(\frac\pi8+\frac14\Big)+\frac{\pi}{12}=\frac{11}{36}-\frac{\pi}{24}.$$

[28]
若 $\alpha_1,\alpha_2,\alpha_3$ 线性无关，则由 $a(\alpha_1+k\alpha_3)+b(\alpha_2+\mu\alpha_3)=0$ 得 $a=b=0$，充分性成立．
反之取 $\alpha_3=0$，$\alpha_1,\alpha_2$ 线性无关，则对任意 $k,\mu$ 结论成立，但 $\alpha_1,\alpha_2,\alpha_3$ 线性相关，必要性不成立．选 **B**．

[29]
消去 $z$：第一式 $+3\times$ 第二式得 $7x-y=11$，此即 $L$ 关于 $z$ 轴方向的投影柱面．故
$$\text{在 }z=0\text{ 上的投影：}\begin{cases}7x-y=11,\\ z=0;\end{cases}\qquad
\text{在 }z=1\text{ 上的投影：}\begin{cases}7x-y=11,\\ z=1.\end{cases}$$

[30]
$\lambda y_1+\mu y_2$ 为非齐次解 $\iff\lambda+\mu=1$；$\lambda y_1-\mu y_2$ 为齐次解 $\iff\lambda-\mu=0$．故 $\lambda=\mu=\frac12$，选 **B**．

[31]
两边取行列式：$|A^*|=|A|^2$，$|-2A|=-8|A|$，故 $|A|^2=-8|A|$．若 $|A|=0$，则 $\mathrm r(A^*)\leqslant1$，与 $A^*=-2A\neq O$ 的秩相矛盾（逐一验证 $\mathrm r(A)=1,2$ 均不可能），故 $|A|=-8$．
由 $A^*=|A|A^{-1}=-8A^{-1}=-2A$ 得 $A^2=4E$，于是
$$\mathrm{tr}\big[(A^2)^{-1}\big]=\mathrm{tr}\Big(\frac14E\Big)=\frac34 .$$

[32]
令 $u=x^2\geqslant0,\;v=y^2\geqslant0$，$s=u+v$，则 $|u-v|\leqslant s$，
$$|x^2-y^2|\mathrm e^{-x^2-y^2}=|u-v|\mathrm e^{-s}\leqslant s\mathrm e^{-s}\leqslant\frac1{\mathrm e},$$
等号在 $s=1$、$uv=0$（如 $x=1,y=0$）处取到．故 $k_{\min}=\dfrac1{\mathrm e}$．

[33]
$\frac{\partial P}{\partial y}=6xy^2-2y\cos x=\frac{\partial Q}{\partial x}$，场为保守场．取势函数
$$u(x,y)=x^2y^3-y^2\sin x+y,$$
故 $W=u\big(\tfrac\pi2,1\big)-u(0,0)=\dfrac{\pi^2}{4}-1+1=\dfrac{\pi^2}{4}$．

[34]
$$\mathrm{Cov}\Big(\frac{3X+Y}{2},\frac{X-2Y}{3}\Big)=\frac16\big(3\sigma^2-5\rho\sigma^2-2\sigma^2\big)=\frac{\sigma^2}{6}(1-5\rho)=0\Longrightarrow \rho=\frac15 .$$

[35]
$f(x)=-\ln\big(x+\sqrt{1+x^2}\big)$，$f'(x)=-\frac{1}{\sqrt{1+x^2}}=-1+\frac{x^2}{2}-\frac{3x^4}{8}+\cdots$，故
$$f(x)=-x+\frac{x^3}{6}-\frac{3x^5}{40}+\cdots,\qquad f^{(5)}(0)=5!\cdot\Big(-\frac{3}{40}\Big)=-9 .$$

[36]
（Ⅰ）$f=(x_1+x_3)^2+2x_2^2+(a-1)x_3^2$，化为 $y_1^2+y_2^2$ 要求秩 $2$、正惯性指数 $2$，故 $a=1$．
取 $y_1=x_1+x_3,\;y_2=\sqrt2x_2,\;y_3=x_3$，即
$$P=\begin{pmatrix}1&0&-1\\0&\frac{1}{\sqrt2}&0\\0&0&1\end{pmatrix},\qquad X=PY .$$
（Ⅱ）$A=\begin{pmatrix}1&0&1\\0&2&0\\1&0&1\end{pmatrix}$ 的特征值为 $0,2,2$，故 $X^{\mathrm T}X=1$ 时 $f_{\max}=2$；
$\lambda=2$ 的特征向量为 $c_1(1,0,1)^{\mathrm T}+c_2(0,1,0)^{\mathrm T}$，由 $x_1=x_2>0$ 及单位化得最大值点 $\Big(\frac{1}{\sqrt3},\frac{1}{\sqrt3},\frac{1}{\sqrt3}\Big)^{\mathrm T}$．

[37]
参数化 $(1+t,-1+2t,2+t),\;t\in[0,1]$，$ds=\sqrt6\,dt$，$x^2+y^2+z^2=6t^2+2t+6$，
$$I=\sqrt6\int_0^1(6t^2+2t+6)dt=9\sqrt6 .$$

[38]
$$V=2\iint_{r\leqslant R\cos\theta}\sqrt{R^2-r^2}\,d\sigma=\frac23R^3\int_{-\frac\pi2}^{\frac\pi2}\big(1-|\sin\theta|^3\big)d\theta=\frac23R^3\Big(\pi-\frac43\Big)=\frac{2}{9}R^3(3\pi-4).$$

[39]
由中心极限定理，$\hat p$ 近似服从 $N\big(0.8,\frac{0.16}{n}\big)$，
$$P\{|\hat p-0.8|<0.04\}\approx2\Phi\Big(\frac{0.04\sqrt n}{0.4}\Big)-1\geqslant0.9\Longrightarrow 0.1\sqrt n\geqslant1.645,$$
$n\geqslant270.6$，故至少生产 $271$ 件．

[40]
（Ⅰ）分子分母同除 $x^2$：$\dfrac{1-\frac{\sin x}{x}}{1+\frac{\sin\frac1x}{x}}\to1$．
（Ⅱ）$\sqrt[3]{abc}$．
（Ⅲ）分子 $=\ln(1+\mathrm e^{-x}\sin^2x)\sim x^2$，分母 $=\ln(1-x^2\mathrm e^{-2x})\sim-x^2$，极限 $=-1$．
（Ⅳ）$(1+x)^{3/x}=\mathrm e^{3}\mathrm e^{-\frac{3x}{2}+o(x)}$，极限 $=-\dfrac{3\mathrm e^3}{2}$．
（Ⅴ）$\dfrac{\mathrm e^x(\mathrm e^{\tan x-x}-1)}{x^3}\sim\dfrac{\tan x-x}{x^3}\to\dfrac13$．
（Ⅵ）$\cot x\cdot\dfrac{x-\sin x}{x\sin x}\sim\dfrac1x\cdot\dfrac{x^3/6}{x^2}=\dfrac16$．
（Ⅶ）指数 $\dfrac{\ln(1-x^2)}{1-\sqrt{1-x^2}}\to\dfrac{-x^2}{x^2/2}=-2$，极限 $=\mathrm e^{-2}$．
（Ⅷ）$\mathrm e^{\lim\sin x\ln x}=\mathrm e^{0}=1$．

[41]
$BX=0$ 的解总是 $ABX=0$ 的解，两者同解 $\iff$ 解空间维数相同 $\iff n-\mathrm r(B)=n-\mathrm r(AB)$，即 $\mathrm r(AB)=\mathrm r(B)$．选 **B**．

[42]
当 $x>0$ 时公比 $\mathrm e^{-x}\in(0,1)$ 收敛；$x=0$ 时每项为 $0$，和为 $0$；$x<0$ 时发散．收敛域 $[0,+\infty)$，
$$S(x)=\frac{x}{1-\mathrm e^{-x}}\;(x>0),\qquad S(0)=0 .$$

[43]
由 $xf(x)=\frac{1}{\sqrt{1-x^2}}$ 得 $\frac{1}{f(x)}=x\sqrt{1-x^2}$，故
$$\int\frac{dx}{f(x)}=\int x\sqrt{1-x^2}\,dx=-\frac13(1-x^2)^{\frac32}+C .$$
选 **C**．

[44]
$$P\{Z=1\}=P\{X\leqslant Y\}=\int_0^{+\infty}\lambda_1\mathrm e^{-\lambda_1x}\mathrm e^{-\lambda_2x}dx=\frac{\lambda_1}{\lambda_1+\lambda_2},\qquad P\{Z=0\}=\frac{\lambda_2}{\lambda_1+\lambda_2}.$$
$$F_Z(z)=\begin{cases}0,&z<0,\\[2pt] \dfrac{\lambda_2}{\lambda_1+\lambda_2},&0\leqslant z<1,\\[4pt] 1,&z\geqslant1 .\end{cases}$$

[45]
由 $\limsup\sqrt[n]{|a_n|}=1$ 及 $\sqrt[n]{n!}\to+\infty$ 得 $\limsup\sqrt[n]{|a_n|/n!}=0$，故收敛半径为 $+\infty$，收敛域为 $(-\infty,+\infty)$．

[46]
曲面 $x^2+y^2=5$ 在 $P$ 处外法向 $\boldsymbol n=(2x,2y,0)\big|_P=(2,4,0)$，单位化 $\frac{1}{\sqrt5}(1,2,0)$；
$$\nabla u=(y^2z^3,\,2xyz^3,\,3xy^2z^2)\big|_P=(-4,-4,12),$$
$$\frac{\partial u}{\partial \boldsymbol n}=\frac{-4-8}{\sqrt5}=-\frac{12\sqrt5}{5}.$$

[47]
底面 $z=0$ 贡献 $0$；顶面 $z=x+R$，$dS=\sqrt2\,dxdy$：
$$\iint_{x^2+y^2\leqslant R^2}(x+R)\sqrt2\,dxdy=\sqrt2\pi R^3 ;$$
侧面 $x=R\cos\theta,y=R\sin\theta,\;0\leqslant z\leqslant R(1+\cos\theta)$，$dS=R\,d\theta dz$：
$$\int_0^{2\pi}\!\!\int_0^{R(1+\cos\theta)}zR\,dz\,d\theta=\frac{R^3}{2}\int_0^{2\pi}(1+\cos\theta)^2d\theta=\frac{3\pi}{2}R^3 .$$
故 $I=\Big(\sqrt2+\dfrac32\Big)\pi R^3$．

[48]
记 $C=A-B\neq O$，$C^2=O$ 知特征值全为 $0$，且 $\mathrm r(C)+\mathrm r(C)\leqslant3$，故 $\mathrm r(C)=1$，
线性无关特征向量个数 $=3-\mathrm r(C-0E)=2$．选 **C**．

[49]
特征方程 $\lambda^2+a\lambda+1=0$，两根之积为 $1$．
$a>2$：两负实根；$a=2$：二重根 $-1$；$0<a<2$：共轭复根实部 $-\frac a2<0$；$a=0$：$\pm\mathrm i$，解为 $\cos x,\sin x$ 有界．
$a<0$ 时实部（或实根）为正，解无界．故 $a\in[0,+\infty)$．

[50]
$H_0:\mu\geqslant12,\;H_1:\mu<12$，$\sigma$ 已知用 $U$ 检验：
$$u=\frac{\bar x-\mu_0}{\sigma/\sqrt n}=\frac{11.2-12}{2.6/10}\approx-3.08<-1.645,$$
落入拒绝域，故在 $\alpha=0.05$ 下**不能**认为该批圆木小头平均直径在 $12$ cm 以上．

[51]
（Ⅰ）由对称性 $\bar x=\bar y=0$；$V$ 的体积 $=\int_0^1\pi z\,dz=\frac\pi2$，$\iiint z\,dV=\int_0^1\pi z^2dz=\frac\pi3$，
故质心为 $\big(0,0,\frac23\big)$．
（Ⅱ）$\Sigma$ 在 $M(a,b,a^2+b^2)$ 处切平面为 $2ax+2by-z-(a^2+b^2)=0$，记 $t=a^2+b^2\in[0,1]$，
$$d(t)=\frac{t+\frac23}{\sqrt{4t+1}},\qquad d'(t)=\frac{2t-\frac13}{(4t+1)^{3/2}},$$
故 $t=\frac16$ 时最近，$L:\;x^2+y^2=\frac16,\;z=\frac16$．在 $L$ 上 $dz=0$，
$$I=\oint_L x\,dy-y\,dx=2\cdot\text{面积}=2\pi\cdot\frac16=\frac{\pi}{3}.$$

[52]
由 $m\frac{dv}{dt}=-kv$ 及 $\frac{dv}{dt}=v\frac{dv}{ds}$ 得 $m\frac{dv}{ds}=-k$，即 $v=v_0-\frac{k}{m}s$．
取 $v_0=600\ \mathrm{km/h}=\frac{500}{3}\ \mathrm{m/s}$，$v_1=100\ \mathrm{km/h}=\frac{250}{9}\ \mathrm{m/s}$，$s=500$ m：
$$k=\frac{m(v_0-v_1)}{s}=\frac{4500\times\frac{1250}{9}}{500}=1250\ (\mathrm{kg/s}).$$
飞机滑行至停止的总距离 $s_{\max}=\frac{mv_0}{k}=\frac{4500\times\frac{500}{3}}{1250}=600$ m，故跑道至少 $600$ m．

[53]
设 $A$ 的特征值为 $\lambda$，则 $A^*$ 的特征值为 $\frac{|A|}{\lambda}=\frac2\lambda$，由 $A^*=A-E$ 得 $\frac2\lambda=\lambda-1$，即 $\lambda^2-\lambda-2=0$，$\lambda=2$ 或 $-1$．
又 $\lambda_1\lambda_2\lambda_3=|A|=2$，只能是 $2,-1,-1$，正、负惯性指数分别为 $1,2$．选 **D**．

[54]
用拉格朗日乘数法：$2=\lambda(8x-2y),\;1=\lambda(8y-2x)\Rightarrow y=\frac23x$，
代入约束得 $\frac{40}{9}x^2=\frac58$，$x=\pm\frac38$，$2x+y=\frac83x=\pm1$．
故 $2x+y\in[-1,1]$．

[55]
（Ⅰ）记行、列交换的初等矩阵为 $P,Q$，则 $B=PAQ$，$A=PBQ$：
$$A=\begin{pmatrix}1&1&1\\0&1&-1\\1&-1&1\end{pmatrix},\quad \alpha_1=(1,0,1)^{\mathrm T},\;\alpha_2=(1,1,-1)^{\mathrm T},\;\alpha_3=(1,-1,1)^{\mathrm T}.$$
（Ⅱ）施密特正交化：$k=\frac{(\alpha_2,\beta_1)}{(\beta_1,\beta_1)}=0$，$l_1=\frac{(\alpha_3,\beta_1)}{(\beta_1,\beta_1)}=1$，$l_2=\frac{(\alpha_3,\beta_2)}{(\beta_2,\beta_2)}=-\frac13$，
此时 $\beta_2=(1,1,-1)^{\mathrm T},\;\beta_3=\frac13(1,-2,-1)^{\mathrm T}$．
（Ⅲ）单位化得
$$Q=\begin{pmatrix}\frac{1}{\sqrt2}&\frac{1}{\sqrt3}&\frac{1}{\sqrt6}\\[2pt]0&\frac{1}{\sqrt3}&-\frac{2}{\sqrt6}\\[2pt]\frac{1}{\sqrt2}&-\frac{1}{\sqrt3}&-\frac{1}{\sqrt6}\end{pmatrix},\qquad
T=Q^{\mathrm T}A=\begin{pmatrix}\sqrt2&0&\sqrt2\\0&\sqrt3&-\frac{1}{\sqrt3}\\0&0&\frac{\sqrt6}{3}\end{pmatrix}.$$

[56]
记 $f(x)=\sum a_nx^n$，则条件即 $2xf(x)+f'(x)=0$，解得 $f(x)=C\mathrm e^{-x^2}$；由 $a_0=f(0)=1$ 得 $f(x)=\mathrm e^{-x^2}$．
故 $\sum\limits_{n=0}^{\infty}a_n=f(1)=\mathrm e^{-1}$．

[57]
条件即 $2\leqslant\dfrac{x}{x^2+y^2}\leqslant4,\;2\leqslant\dfrac{y}{x^2+y^2}\leqslant4$．作反演变换
$$u=\frac{x}{x^2+y^2},\quad v=\frac{y}{x^2+y^2},\qquad |J|=\frac{1}{(x^2+y^2)^2},\quad uv=\frac{xy}{(x^2+y^2)^2},$$
则 $\frac{1}{xy}dxdy=\frac{1}{uv}dudv$，于是
$$I=\int_2^4\!\!\int_2^4\frac{du\,dv}{uv}=(\ln2)^2 .$$

[58]
（Ⅰ）由前两式 $x_1=x_4-2,\;x_2=x_4-4$，代入第三式得 $x_3=2x_4-5$，故
$$X=(-2,-4,-5,0)^{\mathrm T}+t(1,1,2,1)^{\mathrm T}.$$
（Ⅱ）将通解代入 ② 各式并令对 $t$ 恒成立：
$(a-2)t+(3-4a)=-5\Rightarrow a=2$；$(b-4)t+(5-4b)=-11\Rightarrow b=4$；$-5=-c+1\Rightarrow c=6$．
此时 ② 的系数矩阵秩为 $3$，解空间维数也是 $1$，两方程组同解．故 $a=2,b=4,c=6$．

[59]
A：$\frac{1}{x^2\sqrt{1+x}}\sim x^{-5/2}$，$\frac52>1$ 收敛．
B：$\frac{1}{\ln(1+x)}\sim\frac1x$ 在 $0$ 附近发散；C：$\frac{1}{\sin x}\sim\frac1x$ 发散；D：被积函数趋于 $\pm1$，发散．选 **A**．

[60]
（Ⅰ）令 $F(x)=x^2f(x)$，$F(a)=F(b)=0$，由罗尔定理存在 $\xi\in(a,b)$ 使
$$F'(\xi)=\xi\big[2f(\xi)+\xi f'(\xi)\big]=0 ,$$
因 $\xi>a>0$，故 $2f(\xi)+\xi f'(\xi)=0$．
（Ⅱ）令 $G(x)=\mathrm e^{-x^2}f(x)$，$G(a)=G(b)=0$，由罗尔定理存在 $\eta\in(a,b)$ 使
$$G'(\eta)=\mathrm e^{-\eta^2}\big[f'(\eta)-2\eta f(\eta)\big]=0\Longrightarrow 2\eta f(\eta)-f'(\eta)=0 .$$

[61]
（Ⅰ）$z$ 轴与 $L$ 交于原点，夹角余弦 $\frac{1}{\sqrt3}$，旋转面为圆锥：点 $(x,y,z)$ 满足
$$\frac{(x+y+z)^2}{3}=\frac{x^2+y^2+z^2}{3}\cdot 3\cdot\frac13\Longrightarrow (x+y+z)^2=x^2+y^2+z^2,$$
即 $\Sigma:\;xy+yz+zx=0$．
（Ⅱ）在平面 $x+y+z=1$ 上，$L_1$ 满足 $x^2+y^2+z^2=1$，是圆心 $\big(\frac13,\frac13,\frac13\big)$、半径 $\sqrt{\frac23}$ 的圆．
$\mathbf{rot}(z,x,y)=(1,1,1)$，由斯托克斯公式
$$I=\iint_S(1,1,1)\cdot\frac{(1,1,1)}{\sqrt3}\,dS=\sqrt3\cdot\pi\cdot\frac23=\frac{2\sqrt3}{3}\pi .$$

[62]
$$E+B=(E+A)^{-1}\big[(E+A)+(E-A)\big]=2(E+A)^{-1}\Longrightarrow \big[(E+B)^2\big]^{-1}=\frac14(E+A)^2 .$$
$$E+A=\begin{pmatrix}2&0&0\\2&4&0\\0&4&6\end{pmatrix},\quad (E+A)^2=\begin{pmatrix}4&0&0\\12&16&0\\8&40&36\end{pmatrix},\quad
\big[(E+B)^2\big]^{-1}=\begin{pmatrix}1&0&0\\3&4&0\\2&10&9\end{pmatrix}.$$

[63]
（Ⅰ）令 $g(x)=f\big(x+\frac12\big)-f(x),\;x\in[0,\frac12]$，则
$$g(0)=f\big(\tfrac12\big)-f(0),\qquad g\big(\tfrac12\big)=f(1)-f\big(\tfrac12\big)=-g(0).$$
若 $g(0)=0$，取 $\xi=\frac12\in(0,1)$ 即可；否则 $g(0),g(\frac12)$ 异号，由介值定理存在 $\xi\in(0,\frac12)$ 使 $g(\xi)=0$．
（Ⅱ）令 $g(x)=f\big(x+\frac1n\big)-f(x),\;x\in[0,1-\frac1n]$，则
$$\sum_{k=0}^{n-1}g\Big(\frac kn\Big)=f(1)-f(0)=0 .$$
若某个 $g\big(\frac kn\big)=0\;(k\geqslant1)$ 即得；否则其中必有异号者，由介值定理得 $\xi\in\big(0,1-\frac1n\big)\subset(0,1)$ 使 $f(\xi)=f\big(\xi+\frac1n\big)$．

[64]
A 不单调不增；C 中 $F(+\infty)=\frac12\neq1$；D 未设 $f\geqslant0$，不能保证单调不减．
B 中 $F$ 连续、单调增，$F(-\infty)=0,F(+\infty)=1$．选 **B**．

[65]
$$z=\frac{2x}{x^2-y^2}=\frac{1}{x-y}+\frac{1}{x+y},\qquad
\frac{\partial^nz}{\partial y^n}=\frac{n!}{(x-y)^{n+1}}+\frac{(-1)^nn!}{(x+y)^{n+1}} .$$
在 $(2,1)$ 处 $x-y=1,\;x+y=3$，故
$$\frac{\partial^nz}{\partial y^n}\Big|_{(2,1)}=n!\Big[1+\frac{(-1)^n}{3^{n+1}}\Big].$$

[66]
$u_n\to0$，当 $n$ 充分大时 $0<u_n<1$，故 $u_n^2<u_n$，由比较判别法 $\sum u_n^2$ 收敛．
B 取 $u_n=\frac{1}{n^2}$ 反例；C、D 中极限未必存在（可等于 $1$）．选 **A**．

[67]
齐次解 $C_1\cos x+C_2\sin x$；$y''+y=x$ 的特解 $x$；$y''+y=\cos x$ 发生共振，特解 $\frac x2\sin x$．故
$$y=C_1\cos x+C_2\sin x+x+\frac x2\sin x .$$

[68]
由 $AB\subset A$、$\overline A\,\overline B\subset\overline A$ 及二者相等知 $AB=\overline A\,\overline B=\varnothing$，
故 $A\cup B=\Omega$ 且 $AB=\varnothing$，即 $B=\overline A$．于是
$$P(\overline A\mid B)=\frac{P(B)}{P(B)}=1,\qquad P(A\mid\overline B)=\frac{P(A)}{P(A)}=1,\qquad \text{原式}=2 .$$

[69]
$EU=EV=\frac2\pi$，$E(UV)=\frac2\pi\int_0^{\frac\pi2}\sin x\cos x\,dx=\frac1\pi$，
$$\mathrm{Cov}(U,V)=\frac1\pi-\frac{4}{\pi^2}=\frac{\pi-4}{\pi^2}<0 ,$$
且 $U,V$ 不是线性关系，$|\rho|\neq1$．选 **D**．

[70]
$x=\pm1$ 为两条铅直渐近线；$x\to-\infty$ 时 $y\to0$，得水平渐近线 $y=0$；
$x\to+\infty$ 时 $\ln(1+\mathrm e^x)=x+\ln(1+\mathrm e^{-x})\to x$，得斜渐近线 $y=x$．共 $4$ 条，选 **D**．

[71]
$P=\frac1y+yf(xy),\;Q=xf(xy)-\frac{x}{y^2}$，验证 $\frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x}=f(xy)+xyf'(xy)-\frac{1}{y^2}$，积分与路径无关．
取 $F'=f$，势函数 $u=\frac xy+F(xy)$．由于 $A,B$ 两点均有 $xy=2$，
$$I=u(1,2)-u\Big(3,\frac23\Big)=\frac12-\frac92=-4 .$$

[72]
$E\overline X^2=D\overline X=\frac1n$，$ES^2=1$，又 $\overline X$ 与 $S^2$ 独立故 $E(\overline XS)=E\overline X\cdot ES=0$，
$$E(T^2)=n\Big[E\overline X^2-2E(\overline XS)+ES^2\Big]=n\Big(\frac1n+1\Big)=n+1 .$$

[73]
（Ⅰ）由 $A\alpha=\lambda\alpha$ 三个分量：$2-1-2=\lambda$，$5+a-3=\lambda$，$-1+b+2=-\lambda$，
得 $\lambda=-1,\;a=-3,\;b=0$．
（Ⅱ）此时 $\mathrm{tr}A=-3$，$|A|=-1$，结合 $\lambda=-1$ 知特征值为三重 $-1$．而
$$A+E=\begin{pmatrix}3&-1&2\\5&-2&3\\-1&0&-1\end{pmatrix},\qquad \mathrm r(A+E)=2,$$
特征向量只有 $3-2=1$ 个线性无关，故 $A$ **不能**相似于对角矩阵．

[74]
$X,Y$ 独立且同服从 $N(0,\frac12)$，故 $X-Y\sim N(0,1)$，$E|X-Y|=\sqrt{\frac2\pi}$，
$$P\{X-Y>\sqrt{2/\pi}\}=1-\Phi\Big(\sqrt{\frac2\pi}\Big).$$
选 **C**．

[75]
$$f'(t)=\int_0^t\mathrm e^{-(x-t)^2}dx,\qquad
f''(t)=1+\int_0^t2(x-t)\mathrm e^{-(x-t)^2}dx=1+\big(\mathrm e^{-t^2}-1\big)=\mathrm e^{-t^2},$$
故 $f''(1)=\mathrm e^{-1}$．
