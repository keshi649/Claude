[1]
当 $t\to+\infty$ 时 $(1+t^2)\sin\frac1t=t+\frac{5}{6t}+o\big(\frac1t\big)$，故被积函数 $\sim t$，$\int_1^x\sim\frac{x^2}{2}$，
$$\lim_{x\to\infty}\frac{1}{x^3}\int_1^x\Big[(1+t^2)\sin\frac1t-\cos t\Big]dt=0 .$$
（也可用洛必达法则：极限 $=\lim\limits_{x\to\infty}\frac{(1+x^2)\sin\frac1x-\cos x}{3x^2}=0$．）

[2]
由 $\ln y=Cx+x^2$ 得 $C=\frac{\ln y-x^2}{x}$，又 $\frac{y'}{y}=C+2x$，消去 $C$：
$$\frac{xy'}{y}=\ln y-x^2+2x^2=\ln y+x^2\Longrightarrow xy'-y\ln y=x^2y .$$
选 **A**．

[3]
$g=b(y_1+y_2)^2$ 的秩为 $1$，故 $f=(x_1+2x_2)^2+(ax_1+x_2)^2$ 也必须秩为 $1$，即两线性型成比例：
$$\frac{1}{a}=\frac{2}{1}\Longrightarrow a=\frac12 .$$
此时 $f=\frac54(x_1+2x_2)^2$ 半正定，故必须 $b>0$．选 **A**．

[4]
曲线 $x+y+xy=1$ 即 $y=\frac{1-x}{1+x}$，与圆弧都过 $(1,0),(0,1)$，直线 $x+y=1$ 夹在两者之间．
在 $D_1=D\cap\{x+y\leqslant1\}$ 上（关于 $y=x$ 对称，$\iint(x-y)=0$）：
$$\iint_{D_1}(x-y+1)d\sigma=S(D_1)=\int_0^1\Big[(1-x)-\frac{1-x}{1+x}\Big]dx=\frac32-2\ln2 .$$
在 $D_2=D\cap\{x+y>1\}$ 上用极坐标，被积函数 $=(\cos\theta+\sin\theta)^2=c^2$，$\frac1c\leqslant r\leqslant1$：
$$\iint_{D_2}=\int_0^{\frac\pi2}c^2\cdot\frac12\Big(1-\frac{1}{c^2}\Big)d\theta=\frac12\int_0^{\frac\pi2}\sin2\theta\,d\theta=\frac12 .$$
故 $I=\dfrac32-2\ln2+\dfrac12=2-2\ln2$．

[5]
$(1+x)^{2x}=\mathrm e^{2x\ln(1+x)}=1+2x^2+o(x^2)$，故
$$\frac{xf(x)-(1+x)^{2x}+1}{x^2}=\frac{xf(x)-2x^2+o(x^2)}{x^2}\to1\Longrightarrow \lim_{x\to0}\frac{f(x)}{x}=3 .$$
由连续性 $f(0)=\lim\limits_{x\to0}f(x)=0$，于是
$$f'(0)=\lim_{x\to0}\frac{f(x)-f(0)}{x}=3 ,$$
即 $f$ 在 $x=0$ 可导且 $f'(0)=3$．

[6]
$\{u_n\}$ 正、单调减但未必趋于 $0$：A 需 $u_n\to0$；B 取 $u_n\equiv1$ 发散；C 取 $u_n=2^{-n}$ 时通项恒为 $\frac12$ 发散．
D：由 $u_n-u_{n+1}=(\sqrt{u_n}-\sqrt{u_{n+1}})(\sqrt{u_n}+\sqrt{u_{n+1}})\leqslant2\sqrt{u_n}(\sqrt{u_n}-\sqrt{u_{n+1}})$ 得
$$\frac{u_n-u_{n+1}}{\sqrt{u_n}}\leqslant2(\sqrt{u_n}-\sqrt{u_{n+1}}),$$
右端级数（裂项）收敛，故 D 收敛．选 **D**．

[7]
$P\{X=x\}=F(x)-F(x-0)$，故对一切 $x$ 有 $P\{X=x\}=0$ 当且仅当 $F$ 处处连续．选 **B**．

[8]
两式对 $x$ 求导：
$$2x+2yy'+2zz'=3,\qquad 2-3y'+5z'=0 .$$
解得
$$\frac{\mathrm dz}{\mathrm dx}=\frac{9-6x-4y}{2(5y+3z)},\qquad \frac{\mathrm dy}{\mathrm dx}=\frac{15-10x+4z}{2(5y+3z)} .$$

[9]
由高斯公式，$\mathrm{div}\,\boldsymbol\gamma=3$，
$$\iint_S\boldsymbol\gamma\cdot\mathbf n\,dS=3\cdot\frac43\pi=4\pi .$$

[10]
（Ⅰ）$E-A=\begin{pmatrix}4-a&1&-2\\1&4-a&-2\\1&1&1-a\end{pmatrix}$，秩为 $1$ 要求 $(4-a)^2=1$，即 $a=3$ 或 $5$；
$a=5$ 时前两行不成比例，故 $a=3$（此时 $E-A$ 三行全为 $(1,1,-2)$）．
（Ⅱ）$a=3$ 时 $A-E$ 的三行均为 $-(1,1,-2)$，故 $(A-E)\alpha=-(x_1+x_2-2x_3)(1,1,1)^{\mathrm T}$．
又 $(A^2-E)\alpha=(A+E)(A-E)\alpha=(A+E)\beta=2\beta$ 即 $(A-E)\beta=0$，
而 $\beta=k(1,1,1)^{\mathrm T}$ 自动满足．故
$$\alpha=(x_1,x_2,x_3)^{\mathrm T}\ \text{为任一满足}\ t=x_1+x_2-2x_3\neq0\ \text{的向量},\qquad \beta=-t(1,1,1)^{\mathrm T}.$$

[11]
$\big(\frac{F^2}{2}\big)'=Ff=\frac{\ln\tan x}{\sin x\cos x}$，注意 $\mathrm d(\ln\tan x)=\frac{\mathrm dx}{\sin x\cos x}$，故
$$\frac{F^2}{2}=\frac{(\ln\tan x)^2}{2}+C;\qquad F\big(\tfrac\pi4\big)=0\Rightarrow C=0 .$$
在 $\big(\frac\pi4,\frac\pi2\big)$ 上 $F>0$、$\ln\tan x>0$，故 $F=\ln\tan x$，
$$f(x)=F'(x)=\frac{1}{\sin x\cos x}=\frac{2}{\sin 2x}.$$

[12]
驻点：$z'_x=3x^2-6x=0,\;z'_y=-6y=0\Rightarrow(0,0),(2,0)$，$z$ 值为 $0,-4$．
边界 $x^2+y^2=16$ 上 $z=x^3-3x^2-3(16-x^2)=x^3-48\;(-4\leqslant x\leqslant4)$，最大值在 $x=4$ 处为 $16$．
故最大值 $z_{\max}=16$（在点 $(4,0)$ 处取得）．

[13]
记 $u=\frac yx$，$z=(x+y)f(u)$，直接计算得
$$x\frac{\partial^2z}{\partial x\partial y}+2y\frac{\partial^2z}{\partial y^2}=\frac{2y}{x}f'(u)+\frac{y(x+y)}{x^2}f''(u)=\frac yx ,$$
即 $(1+u)f''(u)+2f'(u)=1$．令 $p=f'$，$\big[(1+u)^2p\big]'=1+u$，
$$p=\frac12+\frac{C}{(1+u)^2},\qquad f(u)=\frac u2-\frac{C}{1+u}+D .$$
由 $z(x,x)=2xf(1)=x$ 得 $f(1)=\frac12$；由 $z'_x\big|_{(x,x)}=f(1)-2f'(1)=-\frac32$ 得 $f'(1)=1$，从而 $C=2,\;D=1$：
$$f(u)=\frac u2-\frac{2}{1+u}+1 .$$

[14]
由 $A^n=E$ 知 $A$ 可逆且 $|A|^n=1$．因 $A^*=|A|A^{-1}$，
$$(A^*)^n=|A|^n(A^{-1})^n=(A^n)^{-1}=E .$$

[15]
$\rho=0$ 故 $X,Y$ 独立，$DX=DY=2$．
$$\mathrm{Cov}(U,V)=DX-4DY=2-8=-6,\qquad DU=DV=DX+4DY=10,$$
$$\rho_{UV}=\frac{-6}{10}=-\frac35 .$$

[16]
$\sqrt[n]{|a_n|}\to\frac13$，收敛半径 $R=3$，收敛区间 $(-3,3)$．
$x=3$：通项 $\frac{1}{n\left[1+(-\frac23)^n\right]}\sim\frac1n>0$，发散；
$x=-3$：通项 $\frac{(-1)^n}{n\left[1+(-\frac23)^n\right]}=\frac{(-1)^n}{n}+O\Big(\frac{(2/3)^n}{n}\Big)$，两部分都收敛，故收敛（条件收敛）．
即收敛域为 $[-3,3)$．

[17]
设 $A=\iint_Df\,d\sigma$，则 $A=\iint_Dxy\,d\sigma+A\cdot S_D$，$S_D=2$，得 $A=-\iint_Dxy\,d\sigma$．
而 $\iint_Dxy\,d\sigma=\int_{-1}^{1}x\cdot\frac{1-x^2}{2}dx=0$，故 $A=0$，$f(x,y)=xy$．
此时 $\iint_Df(y,x)d\sigma=\iint_Dxy\,d\sigma=0=\iint_Df\,d\sigma$，而 $\iint_{D_1}f\,d\sigma>0$，故 A、B、D 均不成立．选 **C**．

[18]
记 $L=b-a$．
（Ⅰ）$F_{Z_1}=F^2\Rightarrow f_{Z_1}(z)=\dfrac{2(z-a)}{L^2}$；$1-F_{Z_2}=(1-F)^2\Rightarrow f_{Z_2}(z)=\dfrac{2(b-z)}{L^2}$（$a\leqslant z\leqslant b$）．
（Ⅱ）
$$f(z_1,z_2)=\begin{cases}\dfrac{2}{(b-a)^2},&a\leqslant z_2<z_1\leqslant b,\\[4pt]0,&\text{其他}.\end{cases}$$

[19]
由 $f''>0$ 知 $f(x)>f(0)+f'(0)x\;(x\neq0)$，积分得
$$2=\int_{-1}^1f(x)dx>2f(0)\Longrightarrow f(0)<1 .$$
反之任何 $f(0)<1$ 都可实现．选 **C**．

[20]
$E(X+Y)=0$，
$$D(X+Y)=DX+DY+2\rho_{XY}\sqrt{DX\,DY}=1+4+2\Big(-\frac12\Big)(2)=3 ,$$
$$P\{|X+Y|\geqslant6\}\leqslant\frac{3}{6^2}=\frac{1}{12}.$$

[21]
用极坐标：$r\leqslant2\cos\theta\;(|\theta|\leqslant\frac\pi2)$，高 $h=1-\frac{r}{2\cos\theta}$．
$$V=\int_{-\frac\pi2}^{\frac\pi2}\!\!\int_0^{2\cos\theta}\Big(1-\frac{r}{2\cos\theta}\Big)r\,dr\,d\theta=\int_{-\frac\pi2}^{\frac\pi2}\frac23\cos^2\theta\,d\theta=\frac\pi3 ,$$
$$\iiint_\Omega x\,dV=\int_{-\frac\pi2}^{\frac\pi2}\frac23\cos^4\theta\,d\theta=\frac23\cdot\frac{3\pi}{8}=\frac\pi4 ,$$
故 $\bar x=\dfrac{\pi/4}{\pi/3}=\dfrac34$．

[22]
$$\ln\frac{\arctan(x+1)}{\arctan x}=\ln\Big(1+\frac{\arctan(x+1)-\arctan x}{\arctan x}\Big)\sim\frac{1/x^2}{\pi/2}=\frac{2}{\pi x^2},$$
故 $x^a\cdot\frac{2}{\pi x^2}$ 有非零极限要求 $a=2$，此时 $b=\frac2\pi$．选 **A**．

[23]
法向量 $\mathbf n=(aF_1',\,aF_2',\,-bF_1'-cF_2')$，而 $(b,c,a)\cdot\mathbf n=abF_1'+acF_2'-abF_1'-acF_2'=0$，
故切平面恒平行于方向 $(b,c,a)$，即直线 $\frac xb=\frac yc=\frac za$．选 **B**．

[24]
所给矩阵是特征值 $1$ 的三阶若尔当块，$\mathrm r(J-E)=2$．
四个选项中只有 A 满足 $\mathrm r(M-E)=2$（B、C、D 均为 $1$），故与之相似的是 **A**．

[25]
直线过 $P_0(0,0,-1)$，方向 $s=(3,3,2)$，$\overrightarrow{P_0P}=(1,-1,1)$，
$$\overrightarrow{P_0P}\times s=(-5,1,6),\qquad d=\frac{\sqrt{25+1+36}}{\sqrt{9+9+4}}=\sqrt{\frac{62}{22}}=\frac{\sqrt{341}}{11}.$$

[26]
$f'(1)=n+n^2$，切线 $y-(1+n^2)=(n+n^2)(x-1)$ 与 $x$ 轴交点
$$a_n=1-\frac{1+n^2}{n(n+1)}=\frac{n-1}{n(n+1)}=-\frac1n+\frac{2}{n+1}.$$
$\sum a_nx^{n+1}$ 的收敛半径为 $1$；$x=1$ 时通项 $\sim\frac1n$ 发散，$x=-1$ 时为交错级数收敛，故收敛域 $[-1,1)$．
$$S(x)=-x\sum_{n\geqslant1}\frac{x^n}{n}+2\sum_{n\geqslant1}\frac{x^{n+1}}{n+1}=x\ln(1-x)+2\big[-\ln(1-x)-x\big]=(x-2)\ln(1-x)-2x .$$

[27]
$A$ 的特征值为 $3,-1$；$B$ 的特征值也是 $3,-1$ 且互异，二者都可对角化，故相似：存在可逆 $P$ 使 $P^{-1}AP=B$．
A、C 中 $Q^{-1}AQ$、$P^{\mathrm T}AP$ 仍为对称矩阵而 $B$ 不对称；D 需 $A$ 正定而 $A$ 有负特征值．选 **B**．

[28]
切线交 $x$ 轴于 $N\big(x-\frac{y}{y'},0\big)$．由 $|OM|=|ON|$ 及 $y'>0$ 得 $x-\frac{y}{y'}=-\sqrt{x^2+y^2}$，即
$$\frac{dx}{dy}=\frac{x+\sqrt{x^2+y^2}}{y}.$$
令 $x=uy$：$y\frac{du}{dy}=\sqrt{1+u^2}$，积分得 $u+\sqrt{1+u^2}=Cy$，即 $x+\sqrt{x^2+y^2}=Cy^2$．
由 $y(0)=1$ 得 $C=1$，化简得 $y^2=2x+1$，即
$$y=\sqrt{2x+1}\qquad(\text{满足 }y'>0,\;y''<0).$$

[29]
由对称性 $\oiint_Sx\,dS=\oiint_Sy\,dS=0$，且
$$\oiint_S|z|\,dS=\frac13\oiint_S(|x|+|y|+|z|)dS=\frac13\oiint_S dS=\frac13\cdot8\cdot\frac{\sqrt3}{2}=\frac{4\sqrt3}{3}.$$
故 $I=\dfrac{4\sqrt3}{3}$．

[30]
$A^{\mathrm T}X=0$ 的解即与 $A$ 的所有列正交的向量；两方程组同解
$\iff$ 凡与 $A$ 各列正交者必与 $b$ 正交 $\iff b$ 属于 $A$ 的列空间 $\iff AX=b$ 有解．选 **D**．

[31]
A、B、C 均正确．D 错：$A=PBQ$ 时的列空间为 $B$ 的列空间在 $P$ 下的像，一般会改变．
例如 $B=\begin{pmatrix}1&0\\0&0\end{pmatrix}$，$P=\begin{pmatrix}0&1\\1&0\end{pmatrix}$，$Q=E$，则 $A=\begin{pmatrix}0&0\\1&0\end{pmatrix}$，两者列向量组不等价．选 **D**．

[32]
$y>0$ 时
$$F_Y(y)=P\{-\sqrt y\leqslant X\leqslant\sqrt y\}=\big[\Phi(\sqrt y)-\tfrac12\big]+\frac{1-\mathrm e^{-2\sqrt y}}{2}=\Phi(\sqrt y)-\frac{\mathrm e^{-2\sqrt y}}{2},$$
$y\leqslant0$ 时 $F_Y(y)=0$．求导得
$$f_Y(y)=\frac{\varphi(\sqrt y)+\mathrm e^{-2\sqrt y}}{2\sqrt y}\;(y>0),\qquad f_Y(y)=0\;(y\leqslant0).$$

[33]
$y\neq0$ 时
$$f'_x(0,y)=\lim_{x\to0}\frac{\sqrt{|xy|}}{x}=\lim_{x\to0}\frac{\sqrt{|y|}}{\sqrt{|x|}}\cdot\mathrm{sgn}\,x=\infty\ \text{不存在}.$$
又 $x>0$ 时 $f'_x=\frac12\sqrt{|y/x|}$（A 差一负号），$x<0$ 时 $f'_x=-\frac12\sqrt{|y/x|}$（B 差一负号）．选 **D**．

[34]
$\sigma^2$ 未知用 $t$ 检验，左侧检验的拒绝域为
$$\Big\{\frac{\overline X-\mu_0}{S/\sqrt n}<-t_{\alpha}(n-1)\Big\}.$$

[35]
$x=2$ 对应 $t=1$，此时 $y=3$．又
$$\frac{dy}{dx}=\frac{4-2t}{2t}\Big|_{t=1}=1 ,$$
而所求极限 $=\lim\limits_{n\to\infty}\frac{f(2+\frac1n)-f(2)}{1/n}=f'(2)=1$．

[36]
由 $\mathrm r(AB)=1<\mathrm r(B)=2$ 知 $A$ 不可逆，$|A|=2a-6=0\Rightarrow a=3$，此时 $\mathrm r(A)=2$，
从而 $\mathrm r(A^*)=1$；又 $\mathrm r(B)=2\Rightarrow\mathrm r(B^*)=1$．于是
$$\mathrm r\begin{pmatrix}A&O\\O&B^*\end{pmatrix}=\mathrm r(A)+\mathrm r(B^*)=2+1=3 .$$
选 **B**．

[37]
$x=\int_0^t2\mathrm e^{-u^2}du\sim2t$，$y=\int_0^t\sin(t-u)du=1-\cos t\sim\frac{t^2}{2}$，故
$$y\sim\frac12\Big(\frac x2\Big)^2=\frac{x^2}{8},$$
即 $f(x)$ 与 $x^2$ 同阶但不等价．选 **C**．

[38]
$y=\mathrm e^{-ax}\big[C+\int_0^x\mathrm e^{as}f(s)ds\big]$，由洛必达法则
$$\lim_{x\to+\infty}y=\lim_{x\to+\infty}\frac{\mathrm e^{ax}f(x)}{a\mathrm e^{ax}}=\frac ba ,$$
故有水平渐近线 $y=\frac ba$．选 **C**．

[39]
$|X_i-\mu|$ 服从半正态分布，$E|X_i-\mu|=\sigma\sqrt{\frac2\pi}$，故
$$E\hat\sigma=kn\sigma\sqrt{\frac2\pi}=\sigma\Longrightarrow k=\frac1n\sqrt{\frac\pi2}.$$

[40]
（Ⅰ）$R=2$；$x=2$ 时 $\sum\frac{(-1)^n}{\sqrt n}$ 收敛，$x=-2$ 时 $\sum\frac{1}{\sqrt n}$ 发散．收敛域 $(-2,2]$．
（Ⅱ）$R=3$（中心 $3$）；$x=6$ 时 $\sum\frac1n$ 发散，$x=0$ 时 $\sum\frac{(-1)^n}{n}$ 收敛．收敛域 $[0,6)$．
（Ⅲ）$\sqrt[n]{n^n}=n\to\infty$，$R=0$，收敛域 $\{0\}$．
（Ⅳ）$\sum\frac{x^{2n-1}}{3^n}$ 当 $x^2<3$ 收敛，端点 $x=\pm\sqrt3$ 时通项不趋于 $0$．收敛域 $(-\sqrt3,\sqrt3)$．

[41]
取 $x=R\cos\theta,\;y=R\sin\theta$，$\theta$ 由 $\frac{3\pi}{4}$ 变到 $0$．
$$\int_Ly\,ds=\int_0^{\frac{3\pi}{4}}R\sin\theta\cdot R\,d\theta=R^2\Big(1+\frac{\sqrt2}{2}\Big)=\frac{(2+\sqrt2)R^2}{2};$$
$$\int_Ly\,dx=\int_{\frac{3\pi}{4}}^{0}R\sin\theta\,(-R\sin\theta)d\theta=R^2\int_0^{\frac{3\pi}{4}}\sin^2\theta\,d\theta=R^2\Big(\frac{3\pi}{8}+\frac14\Big)=\frac{(3\pi+2)R^2}{8}.$$

[42]
$X-Y\sim N(0,1)$，故
$$D(|X-Y|)=E(X-Y)^2-\big(E|X-Y|\big)^2=1-\Big(\sqrt{\frac2\pi}\Big)^2=1-\frac2\pi .$$

[43]
（Ⅰ）夹逼：$\frac{\sum k}{n^2+2n}\leqslant\sum\limits_{k=1}^n\frac{k}{n^2+n+k}\leqslant\frac{\sum k}{n^2+n+1}$，两端均 $\to\frac12$，故极限 $=\frac12$．
（Ⅱ）$\sqrt{\frac{n(n+1)}{2}}-\sqrt{\frac{n(n-1)}{2}}=\dfrac{n}{\sqrt{\frac{n(n+1)}{2}}+\sqrt{\frac{n(n-1)}{2}}}\to\dfrac{\sqrt2}{2}$．
（Ⅲ）$\sum\limits_{k=1}^n\frac12\Big(\frac{1}{2k-1}-\frac{1}{2k+1}\Big)\to\frac12$．
（Ⅳ）若为平方根，因调和级数发散，极限为 $+\infty$；若原题为 $n$ 次根号 $\sqrt[n]{H_n}$，则极限为 $1$（题干待核对）．

[44]
交换积分次序：$0<y<\frac\pi4$ 时 $0<x<\tan y$，
$$I=\int_0^{\frac\pi4}\csc2y\Big[\int_0^{\tan y}\frac13x^{-\frac23}dx\Big]dy=\int_0^{\frac\pi4}\frac{(\tan y)^{\frac13}}{\sin2y}dy
\;\overset{t=\tan y}{=\!=\!=}\;\frac12\int_0^1t^{-\frac23}dt=\frac32 .$$

[45]
由 $AB=(\alpha_1,\alpha_2-2\alpha_3,\alpha_3-2\alpha_2)$ 得 $A=BMB^{-1}$，其中 $M=\begin{pmatrix}1&0&0\\0&1&-2\\0&-2&1\end{pmatrix}$，
故 $A$ 的特征值与 $M$ 相同，为 $1,3,-1$，正、负惯性指数为 $2,1$．而 $\mathrm{tr}(AXX^{\mathrm T})=X^{\mathrm T}AX$，
故规范形为 $y_1^2+y_2^2-y_3^2$．选 **B**．

[46]
在 $(x_0,y_0,z_0)$ 处切平面 $\frac{xx_0}{a^2}+\frac{yy_0}{b^2}+\frac{zz_0}{c^2}=1$，三截距为 $\frac{a^2}{x_0},\frac{b^2}{y_0},\frac{c^2}{z_0}$，
$$V=\frac{a^2b^2c^2}{6x_0y_0z_0}.$$
由均值不等式，约束下 $x_0y_0z_0$ 在 $\frac{x_0^2}{a^2}=\frac{y_0^2}{b^2}=\frac{z_0^2}{c^2}=\frac13$ 时最大，$x_0y_0z_0=\frac{abc}{3\sqrt3}$，故
$$V_{\min}=\frac{\sqrt3}{2}abc .$$

[47]
（Ⅰ）设 $k_1\beta+k_2A\beta+k_3A^2\beta=0$，即 $\sum\limits_{i=1}^3(k_1+k_2\lambda_i+k_3\lambda_i^2)\alpha_i=0$．
因 $\alpha_1,\alpha_2,\alpha_3$ 线性无关，得三个方程，其系数行列式为范德蒙德行列式 $\prod_{i<j}(\lambda_j-\lambda_i)\neq0$，故 $k_1=k_2=k_3=0$．
（Ⅱ）由 $A^3\beta=A\beta$ 得 $\sum(\lambda_i^3-\lambda_i)\alpha_i=0$，故 $\lambda_i^3=\lambda_i$，即 $\lambda_i\in\{0,1,-1\}$，又三者互异，故特征值为 $0,1,-1$．
$A-E$ 的特征值为 $-1,0,-2$，故 $\mathrm r(A-E)=2$．

[48]
$$\Big|\frac{\sqrt{n+1}-\sqrt{n-1}}{n}\sin(n+k)\Big|\leqslant\frac{2}{n(\sqrt{n+1}+\sqrt{n-1})}\sim\frac{1}{n^{3/2}},$$
由比较判别法级数绝对收敛（与 $k$ 无关）．选 **A**．

[49]
由 $\frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x}$ 可定出 $k=-1$．此时
$$P=\frac{x}{y\sqrt{x^2+y^2}},\qquad Q=-\frac{x^2}{y^2\sqrt{x^2+y^2}},\qquad u(x,y)=\frac{\sqrt{x^2+y^2}}{y}+C .$$
故
$$I=u(2,2)-u(1,1)=\sqrt2-\sqrt2=0 .$$

[50]
（Ⅰ）①：$x_1=-x_2,\;x_4=x_2$，$x_3$ 自由，基础解系 $(-1,1,0,1)^{\mathrm T},(0,0,1,0)^{\mathrm T}$；
②：$x_1=x_2-x_3,\;x_4=x_3-x_2$，基础解系 $(1,1,0,-1)^{\mathrm T},(-1,0,1,1)^{\mathrm T}$．
（Ⅱ）联立四个方程得 $x_1=-x_2,\;x_4=x_2,\;x_3=2x_2$，故非零公共解为
$$k(-1,1,2,1)^{\mathrm T},\qquad k\neq0 .$$

[51]
$$P\{|X-Y|\leqslant b\}=1-\frac{(a-b)^2}{a^2},\qquad P\{\min(X,Y)\leqslant b\}=1-\frac{(a-b)^2}{a^2},$$
二者相等，故差为 $0$．

[52]
分离变量 $y\,dy=-x\,dx$，得 $x^2+y^2=C$．选 **C**．

[53]
本题需要原书图 2-1（$f''$ 的图形）才能确定：拐点个数 $=f''$ **变号**的点的个数（$f''=0$ 但不变号者不算，$f''$ 不存在但两侧变号且 $f$ 连续者也算）．
因原始材料无图，答案待核对．

[54]
先对 $x$ 积分（$0\leqslant x\leqslant1-y-z$）：
$$I=\iint_{y,z\geqslant0,\;y+z\leqslant1}(1-y)(1-y-z)\mathrm e^{-(1-y-z)^2}dydz
\;\overset{u=1-y-z}{=\!=\!=}\;\int_0^1(1-y)\int_0^{1-y}u\mathrm e^{-u^2}du\,dy$$
$$=\int_0^1 s\cdot\frac{1-\mathrm e^{-s^2}}{2}ds=\frac14-\frac14\big(1-\mathrm e^{-1}\big)=\frac{1}{4\mathrm e}.$$

[55]
$\frac{1}{\sigma^2}\big[\sum(X_i-\overline X)^2+\sum(Y_j-\overline Y)^2\big]\sim\chi^2(n_1+n_2-2)$，故 $T=\frac{\sigma^2}{n_1+n_2-2}\chi^2(n_1+n_2-2)$，
$$D(T)=\frac{\sigma^4}{(n_1+n_2-2)^2}\cdot2(n_1+n_2-2)=\frac{2\sigma^4}{n_1+n_2-2}.$$

[56]
原书图 9-1 缺失，按常见图形（$L_1$：上半圆自 $(1,0)$ 到 $(-1,0)$；$L_3$：下半圆自 $(-1,0)$ 到 $(1,0)$；$L_2$：整圆或上半圆，第一型积分）可判断：
由 $f>0$ 及 $f(x,-y)=f(x,y)$ 得 $I_3=-I_1>0>I_1$，又 $ds\geqslant|dx|$ 故 $I_2>I_3$，
从而 $I_2>I_3>I_1$，选 **B**（图形请核对）．

[57]
$B=AM$，其中 $M=\begin{pmatrix}1&0&0\\1&1&1\\0&1&2\end{pmatrix}$，$|M|=1$．于是
$$A^{-1}+B^{-1}=(E+M^{-1})A^{-1},\qquad |A^{-1}+B^{-1}|=\frac{|M+E|}{|M|}\cdot\frac{1}{|A|}=|M+E| .$$
$M+E=\begin{pmatrix}2&0&0\\1&2&1\\0&1&3\end{pmatrix}$，$|M+E|=10$，故
$$\big|(A^{-1}+B^{-1})^{*}\big|=|A^{-1}+B^{-1}|^{3-1}=100 .$$

[58]
$|A|=a-3$．
（Ⅰ）当 $a=3$ 时 $\alpha_3=2\alpha_2-\alpha_1$，$\mathrm r(\alpha_1,\alpha_2,\alpha_3)=2$；此时 $\beta_1=-3\alpha_1+2\alpha_2$ 总可表示，而 $\beta_2=(1,0,b)^{\mathrm T}$ 可表示当且仅当 $b=1$．
故 $a=3$ 且 $b\neq1$ 时 $\beta_1,\beta_2$ **不能**同时被线性表示．
（Ⅱ）当 $a\neq3$ 时 $A$ 可逆，均可唯一表示：
$$\beta_1=-3\alpha_1+2\alpha_2,\qquad \beta_2=\Big(1+\frac{b-1}{a-3}\Big)\alpha_1-\frac{2(b-1)}{a-3}\alpha_2+\frac{b-1}{a-3}\alpha_3 ;$$
当 $a=3,\;b=1$ 时也可表示（有无穷多种）：$\beta_1=-3\alpha_1+2\alpha_2$，$\beta_2=\alpha_1+t(\alpha_1-2\alpha_2+\alpha_3)$．

[59]
$f(0,1)=0$；$f'_x(0,1)=\lim\limits_{x\to0}\frac{x}{x}=1$，$f'_y(0,1)=\lim\limits_{y\to1}\frac{(y-1)\arcsin0}{y-1}=0$，故 A 错．
又
$$\frac{|f(x,y)-f(0,1)-x|}{\rho}=\frac{|y-1|\arcsin\sqrt{|x|/y}}{\rho}\leqslant\arcsin\sqrt{\frac{|x|}{y}}\to0 ,$$
故 $f$ 在 $(0,1)$ 可微且 $\mathrm df\big|_{(0,1)}=\mathrm dx$．选 **C**．

[60]
记 $g(u)=\int_0^uf$（偶），$h(u)=\int_0^utf(t)dt$（奇，因 $tf(t)$ 为偶函数）．
$\int_a^xh(u)du=H(x)-H(a)$，其中 $H(x)=\int_0^xh$ 为偶函数，故该式为偶函数；
而 $\int_a^xg(u)du$、$\int_0^x\big[g(u)-g(a)\big]du$ 均为奇函数（相差常数）．
故选含 $tf(t)$ 的那一项，即 **A**（A 与 D 在转写中相同，原书应有细节差别，请核对）．

[61]
$$P\{X\leqslant k+1\mid X>k\}=\frac{\mathrm e^{-k}-\mathrm e^{-(k+1)}}{\mathrm e^{-k}}=1-\mathrm e^{-1}.$$

[62]
令 $t=x-1$：$f=\dfrac{t}{2-t}=\dfrac t2\cdot\dfrac{1}{1-\frac t2}=\sum\limits_{n=1}^{\infty}\dfrac{(x-1)^n}{2^n}$，$|x-1|<2$．
故 $f^{(n)}(1)=n!\cdot\dfrac{1}{2^n}=\dfrac{n!}{2^n}\;(n\geqslant1)$．

[63]
$$\int_{\frac12}^{\frac{\sqrt3}{2}}\frac{x^2}{\sqrt{1-x^2}}dx=\frac12\Big[\arcsin x-x\sqrt{1-x^2}\Big]_{\frac12}^{\frac{\sqrt3}{2}}=\frac12\Big(\frac\pi3-\frac\pi6\Big)=\frac{\pi}{12},$$
区间长度为 $\frac{\sqrt3-1}{2}$，故平均值
$$\bar y=\frac{\pi/12}{(\sqrt3-1)/2}=\frac{\pi}{6(\sqrt3-1)}=\frac{(\sqrt3+1)\pi}{12}.$$

[64]
（Ⅰ）方程两边除以 $x^2$：$\Big(\frac fx\Big)'=\frac{a(1-\ln x)}{x^2}+1$，而 $\int\frac{1-\ln x}{x^2}dx=\frac{\ln x}{x}$，故
$$\frac fx=\frac{a\ln x}{x}+x+C\Longrightarrow f(x)=a\ln x+x^2+Cx .$$
由 $f(1)=1-a$ 得 $C=-a$，故 $f(x)=x^2+a(\ln x-x)$．
（Ⅱ）$f(x)=0\iff a=\varphi(x):=\dfrac{x^2}{x-\ln x}$（注意 $x-\ln x>0$）．
$$\varphi'(x)=\frac{x(x+1-2\ln x)}{(x-\ln x)^2}>0 ,$$
故 $\varphi$ 在 $(0,+\infty)$ 上严格增，且 $\varphi(0^+)=0,\;\varphi(+\infty)=+\infty$．
于是方程有唯一实根当且仅当 $a>0$，即 $a\in(0,+\infty)$．

[65]
（Ⅰ）$X,Y$ 独立同服从 $U[0,2]$，
$$f_Z(z)=\begin{cases}\frac z4,&0\leqslant z\leqslant2,\\[2pt]\frac{4-z}{4},&2<z\leqslant4,\\[2pt]0,&\text{其他}.\end{cases}$$
（Ⅱ）$EX=EY=1,\;EX^2=EY^2=\frac43$，
$$E(Z^2)=EX^2+2EX\,EY+EY^2=\frac43+2+\frac43=\frac{14}{3}.$$

[66]
当 $m>n$ 时 $\mathrm r(AB)\leqslant\min\{\mathrm r(A),\mathrm r(B)\}\leqslant n<m$，故 $m$ 阶方阵 $AB$ 不可逆，$|AB|=0$．选 **B**．

[67]
（Ⅰ）方向导数在 $\boldsymbol l=(0,1)$ 方向取最大值 $2$ 说明 $\nabla f(2,1)=(0,2)$：
$$f'_x(2,1)=4+a=0,\qquad f'_y(2,1)=2a+2b=2\Longrightarrow a=-4,\;b=5 .$$
（Ⅱ）此时 $f=X^{\mathrm T}\begin{pmatrix}1&-2\\-2&5\end{pmatrix}X=1$，矩阵特征值 $\lambda=3\pm2\sqrt2$，
距离平方 $d^2\in\big[\frac{1}{\lambda_{\max}},\frac{1}{\lambda_{\min}}\big]=[3-2\sqrt2,\;3+2\sqrt2]$，故
$$d_{\min}=\sqrt2-1,\qquad d_{\max}=\sqrt2+1 .$$

[68]
$D$ 为上半圆盘 $(x-1)^2+y^2\leqslant1\,(y\geqslant0)$，直线 $x+y=2$ 交其边界于 $(1,1),(2,0)$．
$$\iint_D(2-x-y)d\sigma=2\cdot\frac\pi2-1\cdot\frac\pi2-\frac{4}{3\pi}\cdot\frac\pi2=\frac\pi2-\frac23 .$$
记 $D_2=D\cap\{x+y>2\}$，作平移 $u=x-1,v=y$ 并用极坐标（$\frac1c\leqslant r\leqslant1,\;c=\cos\theta+\sin\theta$）：
$$\iint_{D_2}(x+y-2)d\sigma=\int_0^{\frac\pi2}\Big(\frac c3-\frac12+\frac{1}{6c^2}\Big)d\theta=\frac23-\frac\pi4+\frac16=\frac56-\frac\pi4 .$$
故
$$I=\iint_D(2-x-y)d\sigma+2\iint_{D_2}(x+y-2)d\sigma=\Big(\frac\pi2-\frac23\Big)+\Big(\frac53-\frac\pi2\Big)=1 .$$
