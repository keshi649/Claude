[1]
@题目
求
$$\lim_{x\to\infty}\frac{1}{x^{3}}\int_{1}^{x}\Big[(1+t^{2})\sin\frac{1}{t}-\cos t\Big]\mathrm{d}t$$

@切入点
形如 $\dfrac{1}{x^{3}}\displaystyle\int_1^{x}g(t)dt$ 的极限，本质是比较"积分增长的阶"与"$x^{3}$ 的阶"。两条路：

1. **洛必达**：分子分母都趋于无穷（要先确认这一点），求导后变成 $\dfrac{g(x)}{3x^{2}}$，只需知道 $g(x)$ 在 $x\to\infty$ 时的阶。
2. **估计主部**：直接看 $g(t)$ 当 $t\to\infty$ 时的等价量，积分后与 $x^{3}$ 比较。

无论走哪条，核心都是搞清楚
$$g(t)=(1+t^{2})\sin\frac1t-\cos t$$
在 $t\to\infty$ 时的阶。这里的关键是 $\sin\frac1t$ 要展开到足够阶：
$$\sin\frac1t=\frac1t-\frac{1}{6t^{3}}+o(\frac{1}{t^{3}})\Longrightarrow (1+t^{2})\sin\frac1t=t+\frac{5}{6t}+o(\frac1t) ,$$
主部是 $t$（**一阶**）；而 $\cos t$ 只是有界量。所以 $g(t)\sim t$，积分后是 $\dfrac{x^{2}}{2}$ 量级，除以 $x^{3}$ 趋于 $0$。

这里容易犯的错是把 $\sin\frac1t$ 直接换成 $\frac1t$ 从而认为 $(1+t^{2})\sin\frac1t\approx t$ 就完事——虽然结论对，但要确认余项不会更高阶。用洛必达可以完全绕开展开的细节，更稳。

@解答
**方法一（洛必达）**。当 $x\to\infty$ 时，被积函数 $(1+t^{2})\sin\frac1t-\cos t$ 的主部为 $t$，故 $\displaystyle\int_1^{x}\to\infty$，分母 $x^{3}\to\infty$，属 $\dfrac\infty\infty$ 型。由洛必达法则
$$\lim_{x\to\infty}\frac{1}{x^{3}}\int_{1}^{x}[(1+t^{2})\sin\frac1t-\cos t]dt
=\lim_{x\to\infty}\frac{(1+x^{2})\sin\frac1x-\cos x}{3x^{2}} .$$
而
$$(1+x^{2})\sin\frac1x=(1+x^{2})[\frac1x-\frac{1}{6x^{3}}+o(\frac{1}{x^{3}})]=x+\frac{5}{6x}+o(\frac1x) ,$$
$|\cos x|\leqslant1$，故分子是 $x+O(1)$ 量级，
$$\lim_{x\to\infty}\frac{x+O(1)}{3x^{2}}=0 .$$

**方法二（估阶）**。由上式 $g(t)=t+O(1)$，故
$$\int_{1}^{x}g(t)dt=\frac{x^{2}}{2}+O(x) ,$$
除以 $x^{3}$ 后趋于 $0$。

所以所求极限为 $0$。

@考点
$\frac\infty\infty$ 型的洛必达法则（需先验证分子趋于无穷）；变限积分求导；$\sin u$ 在 $u\to0$ 时的泰勒展开；有界量在求阶时可忽略。

易混：使用洛必达前必须确认分子确实趋于无穷（本题被积函数主部为 $t$，积分发散到无穷，条件满足）；若分子有界，$\frac{\text{有界}}{\infty}$ 直接为零，不必洛必达。

@易错
1. 不验证分子趋于无穷就用洛必达。
2. 把 $(1+t^{2})\sin\frac1t$ 的阶估成 $t^{2}$（误以为 $\sin\frac1t$ 是常数量级）或估成 $\frac1t$。
3. 认为 $\cos t$ 无极限就断定整个极限不存在（它只是有界量，不影响阶的比较）。
4. 忽略被积函数在 $t=0$ 附近的意义——本题积分下限为 $1$，$x\to+\infty$，不涉及 $t=0$。

[2]
@题目
设 $C$ 为任意常数，则以 $y = e^{Cx + x^2}$ 为通解的一阶微分方程为（　　）.
A. $xy' - y\ln y = x^2 y$　　B. $xy' + y\ln y = xy^2$
C. $xy' - y\ln y^2 = xy$　　D. $xy' + y\ln y = xy$

@切入点
这是"由通解反求微分方程"，思路与解方程正好相反：通解里有一个任意常数 $C$，要得到**不含 $C$** 的一阶微分方程，就必须把 $C$ **消掉**。消元的标准流程是：

1. 从通解中解出 $C$（通常先取对数或做代数变形使 $C$ 孤立）；
2. 对通解求导，得到另一个含 $C$ 的关系；
3. 两式联立消去 $C$。

本题 $y=\mathrm e^{Cx+x^{2}}$，两边取对数最自然：
$$\ln y=Cx+x^{2}\Longrightarrow C=\frac{\ln y-x^{2}}{x} .$$
求导（对 $\ln y=Cx+x^{2}$ 两边求导更省事，省去乘 $y$）：
$$\frac{y'}{y}=C+2x .$$
把 $C$ 代进去即可。取对数再求导（**对数求导法**）是处理指数型通解的通用技巧，直接对 $y=\mathrm e^{Cx+x^{2}}$ 求导会多带一个因子 $y$，反而麻烦。

@解答
由 $y=\mathrm e^{Cx+x^{2}}$ 得 $y>0$ 且
$$\ln y=Cx+x^{2} .$$
两边对 $x$ 求导：
$$\frac{y'}{y}=C+2x\Longrightarrow C=\frac{y'}{y}-2x .$$
代入 $\ln y=Cx+x^{2}$：
$$\ln y=x(\frac{y'}{y}-2x)+x^{2}=\frac{xy'}{y}-x^{2} ,$$
两边乘 $y$ 并整理：
$$xy'=y\ln y+x^{2}y , \text{即}  xy'-y\ln y=x^{2}y .$$
选 **A**。

@考点
由含一个任意常数的通解反求一阶微分方程（消去常数法）；对数求导法。

易混：反求方程时"求导的次数"应等于"任意常数的个数"：一个常数求一次导得一阶方程，两个常数要求两次导得二阶方程。

@易错
1. 直接对 $y=\mathrm e^{Cx+x^{2}}$ 求导，得到 $y'=(C+2x)y$ 后仍含 $C$，再消元时代数变形出错。
2. 消元后没有整理成选项的形式，导致对不上。
3. 把 $\ln y$ 与 $\ln y^{2}=2\ln y$ 混淆（选项 C 正是这个陷阱）。

[3]
@题目
设 $\alpha_1=(1,2)^{\mathrm T}$，$\alpha_2=(a,1)^{\mathrm T}$，$X=(x_1,x_2)^{\mathrm T}$，若二次型 $f(x_1,x_2)=(\alpha_1,X)^2+(\alpha_2,X)^2$ 经可逆线性变换 $X=PY$ 化为 $g(y_1,y_2)=by_1^2+by_2^2+2by_1y_2\ (b\neq0)$，则（　　）.
A. $a=\frac{1}{2},b>0$　B. $a=-\frac{1}{2},b>0$　C. $a=\frac{1}{2},b>-1$　D. $a=-\frac{1}{2},b>-1$

@切入点
题目给的两个二次型之间是**可逆线性变换**的关系，也就是**合同**。合同保持的不变量是：秩、正惯性指数、负惯性指数。所以只需比较这三个量，根本不用真的去求 $P$。

先看目标 $g$：
$$g=by_1^{2}+by_2^{2}+2by_1y_2=b(y_1+y_2)^{2} ,$$
它是**一个**平方项，秩为 $1$；当 $b>0$ 时正惯性指数为 $1$，$b<0$ 时负惯性指数为 $1$。

再看 $f$：
$$f=(x_1+2x_2)^{2}+(ax_1+x_2)^{2} ,$$
它是两个平方之和，**恒非负**，所以负惯性指数必为 $0$，从而 $b$ 必须 $>0$（这一步就淘汰了 C、D）。

又 $f$ 的秩必须等于 $1$，即这两个平方项**不能独立**——两个线性型 $x_1+2x_2$ 与 $ax_1+x_2$ 必须成比例：
$$\frac{a}{1}=\frac{1}{2}\Longrightarrow a=\frac12 .$$
（否则两个线性型线性无关，$f$ 的秩为 $2$。）

两条合起来得 $a=\frac12$、$b>0$，选 A。全程不需要写出矩阵。

@解答
$$g(y_1,y_2)=by_1^{2}+2by_1y_2+by_2^{2}=b(y_1+y_2)^{2} ,$$
故 $g$ 的秩为 $1$；当 $b>0$ 时正惯性指数为 $1$、负惯性指数为 $0$。

$$f(x_1,x_2)=(\alpha_1,X)^{2}+(\alpha_2,X)^{2}=(x_1+2x_2)^{2}+(ax_1+x_2)^{2}\geqslant0 ,$$
故 $f$ 半正定，负惯性指数为 $0$。由可逆线性变换保持惯性指数，$g$ 的负惯性指数也必须为 $0$，故
$$b>0 .$$

又可逆线性变换保持秩，$f$ 的秩必须等于 $1$，即两个线性型 $x_1+2x_2$ 与 $ax_1+x_2$ 成比例：
$$\frac{a}{1}=\frac{1}{2}\Longrightarrow a=\frac12 .$$
此时 $f=(x_1+2x_2)^{2}+\frac14(x_1+2x_2)^{2}=\frac54(x_1+2x_2)^{2}$，秩为 $1$、正惯性指数为 $1$，与 $b>0$ 时的 $g$ 合同。

故选 **A**。

@考点
惯性定理：可逆线性变换（合同）保持二次型的秩与正、负惯性指数；二次型写成平方和时秩等于线性无关平方项的个数；两个线性型成比例的判定。

易混："标准形"的系数不唯一，但正负项的个数唯一；判断合同只能比较秩与惯性指数，不能比较具体系数。

@易错
1. 只用秩定出 $a$，忘了用"$f$ 半正定"限制 $b$ 的符号，在 A 与 C 之间选错。
2. 认为 $f$ 的秩总是 $2$（两个平方项），忽略它们可能成比例。
3. 比例关系列反，解出 $a=2$ 或 $a=-\frac12$。

[4]
@题目
设 $x^{2}+y^{2}=1\ (x\geqslant 0,y\geqslant 0)$ 与 $x+y+xy=1$ 所围区域为 $D$.
$$f(x,y)=\begin{cases}x-y+1, & x+y\leqslant 1,\\ \dfrac{(x+y)^{2}}{x^{2}+y^{2}}, & x+y>1.\end{cases}$$
计算 $I=\displaystyle\iint_{D}f(x,y)\mathrm{d}x\mathrm{d}y$.

@切入点
这道题把两个难点叠在一起：**区域由两条曲线围成**，**被积函数分段**。处理顺序必须是"先看清区域、再按分界线切开"。

第一步，画区域。曲线 $x+y+xy=1$ 解出 $y=\dfrac{1-x}{1+x}$，它与圆弧 $x^{2}+y^{2}=1$ 都经过 $(1,0)$ 与 $(0,1)$。取 $x=\frac12$ 比较：曲线上 $y=\frac13$，圆上 $y=\frac{\sqrt3}{2}$，而直线 $x+y=1$ 上 $y=\frac12$。所以从下到上依次是：曲线、直线、圆弧。也就是说 $D$ 夹在曲线与圆弧之间，而**分段的分界线 $x+y=1$ 恰好穿过 $D$ 的内部**，把它切成两块：
$$D_1=D\cap\{x+y\leqslant1\}\ (\text{曲线与直线之间}),  D_2=D\cap\{x+y>1\}\ (\text{直线与圆弧之间}) .$$

第二步，两块各选合适的方法：
- $D_1$ 上被积函数是 $x-y+1$。注意 $D_1$ 的两条边界（$x+y+xy=1$ 与 $x+y=1$）**都关于 $y=x$ 对称**，故 $\displaystyle\iint_{D_1}(x-y)d\sigma=0$，积分只剩**面积**，用直角坐标一元积分即可。
- $D_2$ 上被积函数是 $\dfrac{(x+y)^{2}}{x^{2}+y^{2}}$，只依赖于角度：极坐标下等于 $(\cos\theta+\sin\theta)^{2}$，与 $r$ 无关；而 $D_2$ 在极坐标下是 $\dfrac{1}{\cos\theta+\sin\theta}\leqslant r\leqslant1$，形状规整。所以 $D_2$ 用极坐标。

"同一道题的两块用不同坐标系"是完全允许的，选择的依据永远是"被积函数 $+$ 区域"哪个更配。

@解答
曲线 $x+y+xy=1$ 即 $y=\dfrac{1-x}{1+x}$，与圆弧 $x^{2}+y^{2}=1$（$x,y\geqslant0$）都过 $(1,0)$ 与 $(0,1)$，且直线 $x+y=1$ 夹在两者之间。记
$$D_1=D\cap\{x+y\leqslant1\},  D_2=D\cap\{x+y>1\} .$$

**在 $D_1$ 上**：$D_1$ 由 $y=\dfrac{1-x}{1+x}$ 与 $x+y=1$ 围成，关于直线 $y=x$ 对称，故 $\displaystyle\iint_{D_1}(x-y)d\sigma=0$，于是
$$\iint_{D_1}(x-y+1)d\sigma=\iint_{D_1}d\sigma=\int_{0}^{1}[(1-x)-\frac{1-x}{1+x}]dx .$$
由 $\displaystyle\int_0^1(1-x)dx=\frac12$ 及
$$\int_{0}^{1}\frac{1-x}{1+x}dx=\int_{0}^{1}(\frac{2}{1+x}-1)dx=2\ln2-1 ,$$
得
$$\iint_{D_1}(x-y+1)d\sigma=\frac12-(2\ln2-1)=\frac32-2\ln2 .$$

**在 $D_2$ 上**：用极坐标，记 $c=\cos\theta+\sin\theta$，则被积函数
$$\frac{(x+y)^{2}}{x^{2}+y^{2}}=\frac{r^{2}c^{2}}{r^{2}}=c^{2} ,$$
区域为 $0\leqslant\theta\leqslant\dfrac\pi2$，$\dfrac1c\leqslant r\leqslant1$，故
$$\iint_{D_2}f d\sigma=\int_{0}^{\frac\pi2}c^{2}\int_{\frac1c}^{1}r drd\theta=\int_{0}^{\frac\pi2}\frac{c^{2}}{2}(1-\frac{1}{c^{2}})d\theta=\frac12\int_{0}^{\frac\pi2}(c^{2}-1)d\theta .$$
由 $c^{2}=1+\sin2\theta$ 得
$$\iint_{D_2}f d\sigma=\frac12\int_{0}^{\frac\pi2}\sin2\theta d\theta=\frac12\cdot1=\frac12 .$$

合计
$$I=(\frac32-2\ln2)+\frac12=2-2\ln2 .$$

@考点
分段函数的二重积分（按分界线把区域切开）；对称性化简（区域关于 $y=x$ 对称时 $\iint(x-y)d\sigma=0$）；极坐标下"被积函数只含角度"的情形；$(\cos\theta+\sin\theta)^{2}=1+\sin2\theta$。

易混：判断三条曲线的上下位置必须取一个具体的 $x$ 代入比较，不能凭直觉；$D$ 的上边界是圆弧、下边界是 $y=\frac{1-x}{1+x}$，直线只是内部的分界线。

@易错
1. 不切分区域，只用一个表达式积分。
2. 三条曲线的上下关系判断错误，导致 $D_1,D_2$ 弄反。
3. 漏用对称性，在 $D_1$ 上硬算 $\iint(x-y)d\sigma$。
4. $D_2$ 的极坐标下限写成 $0$（内边界是直线 $r=\frac1c$，不是原点）。

[5]
@题目
设函数 $f(x)$ 在 $x=0$ 处连续，且
$$\lim_{x\to 0}\frac{xf(x)-(1+x)^{2x}+1}{x^{2}}=1$$
证明：$f(x)$ 在 $x=0$ 处可导，并求 $f'(0)$.

@切入点
结论要证"$f$ 在 $0$ 处可导"，按定义就是要证明
$$\lim_{x\to0}\frac{f(x)-f(0)}{x}\ \text{存在} .$$
所以必须先知道 $f(0)$ 是多少——而题目只给了"$f$ 在 $0$ 处连续"，说明 $f(0)$ 要从极限条件中**反推**出来。这是本题的逻辑主线。

已知条件里 $f$ 出现在 $xf(x)$ 中，所以先把条件整理成关于 $\dfrac{f(x)}{x}$ 的形式。为此要展开 $(1+x)^{2x}$：
$$(1+x)^{2x}=\mathrm e^{2x\ln(1+x)}=\mathrm e^{2x(x-\frac{x^{2}}{2}+\cdots)}=\mathrm e^{2x^{2}+o(x^{2})}=1+2x^{2}+o(x^{2}) .$$
（注意只需展开到 $x^{2}$，因为分母是 $x^{2}$。）代入条件得
$$\frac{xf(x)-2x^{2}+o(x^{2})}{x^{2}}\to1\Longrightarrow \frac{f(x)}{x}\to3 .$$

到这里关键一步来了：由 $\dfrac{f(x)}{x}\to3$ 得 $f(x)=x\cdot\dfrac{f(x)}{x}\to0\cdot3=0$；再由**连续性** $f(0)=\lim\limits_{x\to0}f(x)=0$。有了 $f(0)=0$，导数定义中的差商恰好就是 $\dfrac{f(x)}{x}$，极限已经算出来了，于是 $f'(0)=3$。

"连续性条件用来确定 $f(0)$"是这类题的固定角色，缺了它就无法从 $\lim\frac{f(x)}{x}$ 推出可导。

@解答
先展开 $(1+x)^{2x}$：
$$(1+x)^{2x}=\mathrm e^{2x\ln(1+x)},  2x\ln(1+x)=2x(x-\frac{x^{2}}{2}+o(x^{2}))=2x^{2}+o(x^{2}) ,$$
故
$$(1+x)^{2x}=1+2x^{2}+o(x^{2}) .$$
代入已知条件：
$$1=\lim_{x\to0}\frac{xf(x)-(1+x)^{2x}+1}{x^{2}}=\lim_{x\to0}\frac{xf(x)-2x^{2}+o(x^{2})}{x^{2}}=\lim_{x\to0}\frac{f(x)}{x}-2 ,$$
故
$$\lim_{x\to0}\frac{f(x)}{x}=3 .$$

由此 $\displaystyle\lim_{x\to0}f(x)=\lim_{x\to0}x\cdot\frac{f(x)}{x}=0\cdot3=0$；又 $f$ 在 $x=0$ 处连续，故
$$f(0)=\lim_{x\to0}f(x)=0 .$$
于是
$$\lim_{x\to0}\frac{f(x)-f(0)}{x}=\lim_{x\to0}\frac{f(x)}{x}=3 ,$$
即 $f$ 在 $x=0$ 处可导，且
$$f'(0)=3 .$$

@考点
导数的定义；用连续性确定函数在一点的值；$a^{b}=\mathrm e^{b\ln a}$ 与泰勒展开定阶；"极限存在且分母趋于零 $\Rightarrow$ 分子趋于零"的推理。

易混：只有 $\lim\limits_{x\to0}\frac{f(x)}{x}$ 存在还不能说 $f'(0)$ 存在，必须同时知道 $f(0)=0$；而 $f(0)=0$ 正是由连续性 $+$ $\lim f(x)=0$ 得到的。

@易错
1. 不用连续性，直接把 $\lim\frac{f(x)}{x}$ 当成 $f'(0)$。
2. $(1+x)^{2x}$ 展开只到一阶，得 $1+2x^{2}$ 之外的错误主部（如误当成 $1+2x$）。
3. 展开 $\ln(1+x)$ 时漏掉 $-\frac{x^{2}}{2}$（本题这一项乘 $2x$ 后是 $o(x^{2})$，不影响结果，但要交代）。
4. 最后忘记写出 $f'(0)$ 的值。

[6]
@题目
设 $\{u_n\}$ 是单调减少的正值数列，则下列级数中收敛的是（　　）.
A. $\sum\limits_{n=1}^{\infty} (-1)^{n-1} u_n$　　B. $\sum\limits_{n=1}^{\infty} \dfrac{u_n}{n}$
C. $\sum\limits_{n=1}^{\infty} (1 - \dfrac{u_{n+1}}{u_n})$　　D. $\sum\limits_{n=1}^{\infty} \dfrac{u_n - u_{n+1}}{\sqrt{u_n}}$

@切入点
题设只说 $\{u_n\}$ 是**单调减少的正值**数列——注意它**没有说 $u_n\to0$**！单调减少且有下界 $0$，极限存在但可能是某个正数。这一点是全题的钥匙：凡是需要 $u_n\to0$ 的选项，都可以用"$u_n\to$ 正数"的例子打掉。

- A（莱布尼茨型）：交错级数收敛需要 $u_n\to0$。取 $u_n=1+\frac1n$（单调减、正），则通项不趋于 $0$，发散。
- B：取同样的 $u_n$，$\dfrac{u_n}{n}>\dfrac1n$，由比较判别法发散。
- C：取 $u_n=2^{-n}$，则 $1-\dfrac{u_{n+1}}{u_n}=\dfrac12$ 恒定，通项不趋于 $0$，发散。
- D：这是唯一能证明的。思路是把 $u_n-u_{n+1}$ **因式分解**成含 $\sqrt{u_n}-\sqrt{u_{n+1}}$ 的形式，从而与一个裂项级数比较：
$$u_n-u_{n+1}=(\sqrt{u_n}-\sqrt{u_{n+1}})(\sqrt{u_n}+\sqrt{u_{n+1}})\leqslant2\sqrt{u_n}(\sqrt{u_n}-\sqrt{u_{n+1}}) ,$$
（用到 $\sqrt{u_{n+1}}\leqslant\sqrt{u_n}$），于是
$$\frac{u_n-u_{n+1}}{\sqrt{u_n}}\leqslant2(\sqrt{u_n}-\sqrt{u_{n+1}}) ,$$
右端求和是望远镜级数，部分和 $=2(\sqrt{u_1}-\sqrt{u_{N+1}})$ 有界，故收敛。

"用平方差把差分变成可裂项的形式"是这道题唯一的技巧点。

@解答
注意题设只保证 $\{u_n\}$ 正且单调减少，**未必** $u_n\to0$。

A 错误。取 $u_n=1+\dfrac1n$（正、严格递减），则 $(-1)^{n-1}u_n$ 不趋于 $0$，级数发散。

B 错误。同取 $u_n=1+\dfrac1n>1$，则 $\dfrac{u_n}{n}>\dfrac1n$，而 $\sum\dfrac1n$ 发散，由比较判别法级数发散。

C 错误。取 $u_n=2^{-n}$（正、严格递减），则 $1-\dfrac{u_{n+1}}{u_n}=1-\dfrac12=\dfrac12$，通项不趋于 $0$，级数发散。

D 正确。因 $0<u_{n+1}\leqslant u_n$，有 $\sqrt{u_n}+\sqrt{u_{n+1}}\leqslant2\sqrt{u_n}$，故
$$\frac{u_n-u_{n+1}}{\sqrt{u_n}}=\frac{(\sqrt{u_n}-\sqrt{u_{n+1}})(\sqrt{u_n}+\sqrt{u_{n+1}})}{\sqrt{u_n}}\leqslant2(\sqrt{u_n}-\sqrt{u_{n+1}}) .$$
右端级数的部分和
$$\sum_{n=1}^{N}2(\sqrt{u_n}-\sqrt{u_{n+1}})=2(\sqrt{u_1}-\sqrt{u_{N+1}})\leqslant2\sqrt{u_1} ,$$
有界，故 $\sum2(\sqrt{u_n}-\sqrt{u_{n+1}})$ 收敛。由正项级数的比较判别法，$\displaystyle\sum_{n=1}^{\infty}\frac{u_n-u_{n+1}}{\sqrt{u_n}}$ 收敛。

选 **D**。

@考点
莱布尼茨判别法的条件（单调趋于零，两条缺一不可）；正项级数的比较判别法；裂项（望远镜）级数；平方差因式分解 $a-b=(\sqrt a-\sqrt b)(\sqrt a+\sqrt b)$。

易混："单调减少的正数列"只保证极限存在且非负，不保证极限为 $0$；这是 A、B、C 三个选项被淘汰的共同原因。

@易错
1. 默认 $u_n\to0$，从而认为 A 成立。
2. 反例举得不合法（例如取 $u_n=\frac1n$，此时 A、B 都收敛，看不出问题）——反例必须用"极限为正数"或"等比衰减"的数列。
3. D 中不等式方向弄反（应把分母 $\sqrt{u_n}$ 放大成 $\frac{\sqrt{u_n}+\sqrt{u_{n+1}}}{2}$ 的下界）。
4. 忘记正项级数才能用比较判别法（D 的通项确实非负）。

[7]
@题目
设 $X$ 是随机变量，对任意实数 $x$，$P\{X=x\}=0$ 的充分必要条件是（　　）.
A. $X$ 的概率密度 $f(x)$ 是连续函数
B. $X$ 的分布函数 $F(x)$ 是连续函数
C. $X$ 为离散型随机变量
D. $X$ 是非离散型随机变量

@切入点
$P\{X=x\}$ 与分布函数之间有一个精确的恒等式，这是本题的全部依据：
$$P\{X=x\}=F(x)-F(x^{-}) ,$$
即"单点概率 $=$ 分布函数在该点的**跳跃高度**"。（因为 $F$ 右连续，$F(x)=P\{X\leqslant x\}$，而 $F(x^{-})=P\{X<x\}$。）

于是
$$\forall x,\ P\{X=x\}=0\Longleftrightarrow \forall x,\ F(x)=F(x^{-})\Longleftrightarrow F\ \text{处处连续} ,$$
恰好是选项 B，而且是**充要**的。

再逐一看其余选项为什么不对：
- A：密度存在（连续型）确实能推出 $F$ 连续，但**不必要**——存在 $F$ 连续却没有密度的随机变量（如奇异连续型），而且即使有密度，密度也未必连续。所以只充分不必要。
- C：离散型必有正概率的点，与结论相反。
- D：非离散型可以是**混合型**（既有连续部分又有跳跃点），此时仍有 $P\{X=x_0\}>0$；所以只必要不充分。

@解答
由分布函数的定义与右连续性，
$$P\{X=x\}=P\{X\leqslant x\}-P\{X<x\}=F(x)-F(x^{-}) ,$$
即 $P\{X=x\}$ 等于 $F$ 在点 $x$ 处的跳跃高度。

故
$$\forall x\in\mathbb R,\ P\{X=x\}=0\Longleftrightarrow \forall x\in\mathbb R,\ F(x)=F(x^{-})\Longleftrightarrow F(x)\ \text{处处连续} .$$
选 **B**。

（A 只充分不必要：有密度 $\Rightarrow F$ 连续，但 $F$ 连续未必有密度，且密度未必连续；C 显然错误，离散型必有正概率点；D 只必要不充分：混合型随机变量是非离散的，却仍可能有正概率的点。）

@考点
分布函数的基本性质（右连续、单调不减）；单点概率等于分布函数的跳跃高度；连续型、离散型、混合型随机变量的分类。

易混："$F$ 连续"与"$X$ 是连续型（有概率密度）"不等价：后者强于前者。教材中"连续型"特指有密度的情形。

@易错
1. 选 A，把"有密度"当成"$F$ 连续"的等价条件。
2. 选 D，忽略混合型随机变量。
3. 把 $P\{X=x\}$ 写成 $F(x^{+})-F(x)$（$F$ 右连续，这恒为 $0$）。

[8]
@题目
设 $y=y(x)$，$z=z(x)$ 由方程组
$$\begin{cases}x^{2}+y^{2}+z^{2}=3x,\\ 2x-3y+5z=4\end{cases}$$
确定，求 $\dfrac{\mathrm{d}y}{\mathrm{d}x}$，$\dfrac{\mathrm{d}z}{\mathrm{d}x}$.

@切入点
这是**方程组确定的隐函数**：两个方程、三个变量 $x,y,z$，其中 $x$ 是自变量，$y,z$ 都是 $x$ 的函数。求 $\dfrac{dy}{dx},\dfrac{dz}{dx}$ 的标准做法是：

**把两个方程都对 $x$ 求全导数**（把 $y,z$ 都看成 $x$ 的函数），得到关于 $y',z'$ 的**二元一次方程组**，再解这个代数方程组。

关键细节：求导时每遇到 $y$ 就要乘 $y'$、每遇到 $z$ 就要乘 $z'$（复合函数求导），例如 $y^{2}$ 对 $x$ 求导得 $2yy'$。这是最常出错的地方。

对两式求导：
$$2x+2yy'+2zz'=3,  2-3y'+5z'=0 .$$
第二个方程最简单（常系数），从它解出 $y'$ 用 $z'$ 表示，再代入第一式，比用克拉默法则更快。当然用克拉默法则也可以：
$$\begin{pmatrix}2y&2z\\-3&5\end{pmatrix}\begin{pmatrix}y'\\z'\end{pmatrix}=\begin{pmatrix}3-2x\\-2\end{pmatrix},$$
系数行列式 $=10y+6z=2(5y+3z)$，这就是最终答案分母的来源。

@解答
把 $y,z$ 都视为 $x$ 的函数，两个方程分别对 $x$ 求导：
$$2x+2y\frac{dy}{dx}+2z\frac{dz}{dx}=3,  2-3\frac{dy}{dx}+5\frac{dz}{dx}=0 .$$
整理成关于 $\dfrac{dy}{dx},\dfrac{dz}{dx}$ 的线性方程组：
$$\begin{cases}2y y'+2z z'=3-2x,\\ -3y'+5z'=-2 .\end{cases}$$
系数行列式
$$\begin{vmatrix}2y&2z\\-3&5\end{vmatrix}=10y+6z=2(5y+3z) .$$
由克拉默法则（设 $5y+3z\neq0$）：
$$\frac{dy}{dx}=\frac{\begin{vmatrix}3-2x&2z\\-2&5\end{vmatrix}}{2(5y+3z)}=\frac{5(3-2x)+4z}{2(5y+3z)}=\frac{15-10x+4z}{2(5y+3z)},$$
$$\frac{dz}{dx}=\frac{\begin{vmatrix}2y&3-2x\\-3&-2\end{vmatrix}}{2(5y+3z)}=\frac{-4y+3(3-2x)}{2(5y+3z)}=\frac{9-6x-4y}{2(5y+3z)} .$$

@考点
由方程组确定的隐函数求导；对含 $y,z$ 的项求导时要乘 $y',z'$；线性方程组的克拉默法则；隐函数存在的条件（雅可比行列式非零，本题即 $5y+3z\neq0$）。

易混：这里 $y,z$ 都是**一元**函数（自变量只有 $x$），所以用全导数记号 $\frac{dy}{dx}$；若方程中还有别的自变量，才是偏导数。

@易错
1. 求导时忘记乘 $y'$ 或 $z'$（把 $y^{2}$ 的导数写成 $2y$）。
2. 移项时把 $3-2x$ 的符号弄错。
3. 克拉默法则中替换的列搞错。
4. 不交代分母非零的条件。

[9]
@题目
设 $\boldsymbol\gamma=x\mathbf i+y\mathbf j+z\mathbf k$，$\mathbf n$ 为球面 $S:x^2+y^2+z^2=1$ 的外单位法向量，则
$$\iint_S \boldsymbol\gamma\cdot\mathbf n\,dS=\underline{\qquad}$$

@切入点
$\displaystyle\iint_S\boldsymbol\gamma\cdot\mathbf n dS$ 是"向量场穿过闭曲面的通量"，$S$ 闭且 $\mathbf n$ 取外法向——这是**高斯公式**的标准配置：
$$\iint_S\mathbf F\cdot\mathbf n dS=\iiint_{\Omega}\mathrm{div} \mathbf F dV .$$
本题 $\mathbf F=\boldsymbol\gamma=(x,y,z)$ 是位置向量场，散度
$$\mathrm{div} \boldsymbol\gamma=\frac{\partial x}{\partial x}+\frac{\partial y}{\partial y}+\frac{\partial z}{\partial z}=3 ,$$
是常数，于是通量 $=3\times$ 体积，一步出结果。

还有一条更快的路：在单位球面上 $\mathbf n=(x,y,z)$（外单位法向量就是位置向量本身），故
$$\boldsymbol\gamma\cdot\mathbf n=x^{2}+y^{2}+z^{2}=1 ,$$
积分就等于球面的面积 $4\pi$。两条路结果一致，可互相验证。

记住这个结论：**位置向量场穿过任何闭曲面的通量等于所围体积的 $3$ 倍**。

@解答
**方法一（高斯公式）**。$\mathrm{div} \boldsymbol\gamma=1+1+1=3$，$S$ 所围区域 $\Omega$ 是单位球，体积 $\dfrac43\pi$，故
$$\iint_S\boldsymbol\gamma\cdot\mathbf n dS=\iiint_{\Omega}3 dV=3\cdot\frac43\pi=4\pi .$$

**方法二（直接计算）**。单位球面上外单位法向量 $\mathbf n=(x,y,z)$，故
$$\boldsymbol\gamma\cdot\mathbf n=x^{2}+y^{2}+z^{2}=1 ,$$
$$\iint_S\boldsymbol\gamma\cdot\mathbf n dS=\iint_SdS=4\pi\cdot1^{2}=4\pi .$$

@考点
高斯（散度）公式；散度的计算；位置向量场的散度恒为 $3$；球面上外单位法向量与位置向量的关系；球的体积 $\frac43\pi R^{3}$ 与球面面积 $4\pi R^{2}$。

易混：$\iint\mathbf F\cdot\mathbf n dS$（第一类曲面积分形式）与 $\iint P dydz+Q dzdx+R dxdy$（第二类）是同一个量的两种写法，$\mathbf n dS=(dydz,dzdx,dxdy)$。

@易错
1. 把球体积写成 $4\pi$（那是面积）。
2. 散度算成 $x+y+z$。
3. 忽略 $\mathbf n$ 是**单位**法向量（若不是单位的，$\boldsymbol\gamma\cdot\mathbf n$ 就不等于 $1$）。

[10]
@题目
设
$$A = \begin{bmatrix} a-3 & -1 & 2 \\ -1 & a-3 & 2 \\ -1 & -1 & a \end{bmatrix}$$
且 $\mathrm{r}(E-A) = 1$.
（Ⅰ）求 $a$ 的值；
（Ⅱ）若非零列向量 $\alpha, \beta$ 满足 $(A-E)\alpha = \beta$，$(A^{2}-E)\alpha = 2\beta$，求所有满足题意的 $\alpha, \beta$.

@切入点
（Ⅰ）$\mathrm r(E-A)=1$ 的含义是：$E-A$ 的所有行向量**两两成比例**（且不全为零）。所以不必算行列式，直接让三行成比例即可。
$$E-A=\begin{pmatrix}4-a&1&-2\\1&4-a&-2\\1&1&1-a\end{pmatrix} .$$
比较第一行与第三行：第二个分量都是 $1$，说明比例系数只能是 $1$，于是第一、三分量也必须相等：$4-a=1$ 且 $-2=1-a$，两者都给出 $a=3$。这种"抓住一个已知比例的分量来定比例系数"的做法最省事。

（Ⅱ）$a=3$ 时
$$A-E=\begin{pmatrix}-1&-1&2\\-1&-1&2\\-1&-1&2\end{pmatrix},$$
三行完全相同，所以对任意 $\alpha=(x_1,x_2,x_3)^{\mathrm T}$，
$$(A-E)\alpha=-t (1,1,1)^{\mathrm T},  t=x_1+x_2-2x_3 ,$$
即 $\beta$ **必然是 $(1,1,1)^{\mathrm T}$ 的倍数**，且 $\beta\neq0$ 要求 $t\neq0$。

再看第二个条件。关键是把 $A^{2}-E$ **因式分解**：
$$(A^{2}-E)\alpha=(A+E)(A-E)\alpha=(A+E)\beta=2\beta\Longleftrightarrow A\beta=\beta\Longleftrightarrow (A-E)\beta=0 .$$
（这里用到 $A+E$ 与 $A-E$ 可交换。）而 $\beta$ 是 $(1,1,1)^{\mathrm T}$ 的倍数，代入验证 $(A-E)(1,1,1)^{\mathrm T}=0$ 恰好成立——所以第二个条件**自动满足**，不产生新的限制。这一发现是本题的关键。

@解答
（Ⅰ）
$$E-A=\begin{pmatrix}4-a&1&-2\\1&4-a&-2\\1&1&1-a\end{pmatrix} .$$
$\mathrm r(E-A)=1$ 要求各行成比例。比较第一行与第三行：二者第二个分量都为 $1$，故比例系数为 $1$，于是
$$4-a=1\ \text{且}\ -2=1-a\Longrightarrow a=3 .$$
验证：$a=3$ 时 $E-A=\begin{pmatrix}1&1&-2\\1&1&-2\\1&1&-2\end{pmatrix}$，秩确为 $1$。故 $a=3$。

（Ⅱ）$a=3$ 时
$$A-E=\begin{pmatrix}-1&-1&2\\-1&-1&2\\-1&-1&2\end{pmatrix} .$$
设 $\alpha=(x_1,x_2,x_3)^{\mathrm T}$，记 $t=x_1+x_2-2x_3$，则
$$\beta=(A-E)\alpha=-t (1,1,1)^{\mathrm T} .$$
由 $\beta\neq0$ 得 $t\neq0$。

又由 $A+E$ 与 $A-E$ 可交换，
$$(A^{2}-E)\alpha=(A+E)(A-E)\alpha=(A+E)\beta=2\beta\Longleftrightarrow A\beta=\beta\Longleftrightarrow (A-E)\beta=0 .$$
而
$$(A-E)(1,1,1)^{\mathrm T}=(-1-1+2)(1,1,1)^{\mathrm T}\ \text{的各行}=0 ,$$
故 $(A-E)\beta=0$ 自动成立，第二个条件不产生新约束。

综上，所有满足题意的解为
$$\alpha=(x_1,x_2,x_3)^{\mathrm T}\ \text{满足}\ t=x_1+x_2-2x_3\neq0,  \beta=-t (1,1,1)^{\mathrm T} .$$

@考点
矩阵秩为 $1$ 的刻画（各行（列）成比例）；矩阵多项式的因式分解 $A^{2}-E=(A+E)(A-E)$（利用 $A$ 与 $E$ 可交换）；齐次方程组的解。

易混：一般两个矩阵不可交换，但 $A$ 的多项式之间总是可交换的，所以 $A^{2}-E$ 可以像数一样因式分解——这是本题能顺利化简的依据。

@易错
1. （Ⅰ）用 $|E-A|=0$ 求 $a$——那只保证秩 $\leqslant2$，不够。
2. （Ⅰ）漏掉对 $a=5$ 之类候选值的排除（本题用比例法可直接避免）。
3. （Ⅱ）没把 $A^{2}-E$ 分解，硬算 $A^{2}$。
4. 忘记 $\beta\neq0$ 的要求，漏掉 $t\neq0$ 的条件。

[11]
@题目
设 $F(x)$ 是 $f(x)$ 的一个原函数，$F\big(\frac{\pi}{4}\big)=0$，当 $\frac{\pi}{4}<x<\frac{\pi}{2}$ 时，$F(x)>0$，
$$F(x)f(x)=\frac{\ln(\tan x)}{\sin x\cos x}$$
则 $f(x)=$ ______.

@切入点
条件里同时出现 $F$ 和 $f$，而 $F'=f$，所以乘积 $Ff$ 其实是一个**完全导数**：
$$F(x)f(x)=F(x)F'(x)=(\frac{F^{2}(x)}{2})' .$$
识破这一点，问题就从"解方程"变成了"两边积分"。这是本题的第一个关键。

第二个关键是右端的积分。看到 $\dfrac{1}{\sin x\cos x}$ 要马上想到
$$\mathrm d(\ln\tan x)=\frac{\sec^{2}x}{\tan x}dx=\frac{dx}{\sin x\cos x} ,$$
于是右端
$$\frac{\ln\tan x}{\sin x\cos x}dx=\ln\tan x\ \mathrm d(\ln\tan x)=\mathrm d(\frac{(\ln\tan x)^{2}}{2}) ,$$
也是完全导数。两边积分立刻得到
$$F^{2}=(\ln\tan x)^{2}+C .$$

第三个关键是**定符号**。由 $F^{2}=(\ln\tan x)^{2}$ 只能得出 $F=\pm\ln\tan x$，必须用题给的条件筛选：$F(\frac\pi4)=0$ 定出 $C=0$；在 $(\frac\pi4,\frac\pi2)$ 上 $F>0$ 且 $\tan x>1$ 使 $\ln\tan x>0$，故取正号。题目给这两个条件，就是为了定这个符号。

@解答
因 $F'=f$，
$$F(x)f(x)=F(x)F'(x)=(\frac{F^{2}(x)}{2})' .$$
又由 $(\ln\tan x)'=\dfrac{\sec^{2}x}{\tan x}=\dfrac{1}{\sin x\cos x}$，
$$\frac{\ln\tan x}{\sin x\cos x}=\ln\tan x\cdot(\ln\tan x)'=(\frac{(\ln\tan x)^{2}}{2})' .$$
故
$$(\frac{F^{2}}{2})'=(\frac{(\ln\tan x)^{2}}{2})'\Longrightarrow F^{2}(x)=(\ln\tan x)^{2}+C .$$
由 $F(\dfrac\pi4)=0$ 且 $\ln\tan\dfrac\pi4=\ln1=0$ 得 $C=0$，即
$$F^{2}(x)=(\ln\tan x)^{2} .$$
当 $\dfrac\pi4<x<\dfrac\pi2$ 时 $\tan x>1$，$\ln\tan x>0$；又题设 $F(x)>0$，故
$$F(x)=\ln\tan x ,$$
从而
$$f(x)=F'(x)=\frac{1}{\sin x\cos x}=\frac{2}{\sin2x} .$$

@考点
原函数的定义 $F'=f$；识别完全导数 $FF'=(\frac{F^{2}}{2})'$；凑微分 $\frac{dx}{\sin x\cos x}=d(\ln\tan x)$；由定解条件确定开方的符号。

易混：$\dfrac{1}{\sin x\cos x}=\dfrac{2}{\sin2x}=\sec x\csc x$，三种写法等价；它的原函数是 $\ln|\tan x|$。

@易错
1. 不识别完全导数，试图把 $F$ 与 $f$ 当成两个独立的未知函数。
2. 开方时不定符号，答案写成 $\pm\ln\tan x$。
3. 忘记用 $F(\frac\pi4)=0$ 定常数 $C$。
4. 求 $F'$ 时算错（$(\ln\tan x)'$ 就是 $\frac{1}{\sin x\cos x}$，与右端的分母一致，可作检验）。

[12]
@题目
求函数 $z=x^{3}-3x^{2}-3y^{2}$ 在闭区域 $D:x^{2}+y^{2}\leqslant 16$ 上的最大值.

@切入点
闭区域上求最值是"两步走"的固定流程，一步都不能少：

1. **内部驻点**：解 $z_x=z_y=0$，求出所有驻点（在区域内部的），算出函数值。注意这里**不需要**判别是极大还是极小——最后统一比较即可。
2. **边界最值**：把边界方程代入，把二元问题降成一元问题再求最值。

本题边界是圆 $x^{2}+y^{2}=16$，代入时的巧劲是：**用 $y^{2}=16-x^{2}$ 消去 $y$**（而不是用三角参数），因为 $z$ 中的 $y$ 只以 $y^{2}$ 出现：
$$z=x^{3}-3x^{2}-3(16-x^{2})=x^{3}-48 ,$$
二次项奇迹般地抵消，边界上 $z$ 竟然是 $x$ 的单调增函数！于是边界最大值在 $x=4$（即点 $(4,0)$）处取到，值为 $16$。

最后把内部驻点值 $0,-4$ 与边界最大值 $16$ 比较，取最大者。

@解答
**内部驻点**：
$$z'_x=3x^{2}-6x=3x(x-2)=0,  z'_y=-6y=0 ,$$
得驻点 $(0,0)$ 与 $(2,0)$，均在 $D$ 内部，函数值
$$z(0,0)=0,  z(2,0)=8-12=-4 .$$

**边界上**：$x^{2}+y^{2}=16$，即 $y^{2}=16-x^{2}$（$-4\leqslant x\leqslant4$），代入得
$$z=x^{3}-3x^{2}-3(16-x^{2})=x^{3}-48 .$$
它关于 $x$ 单调递增，故在 $x=4$（此时 $y=0$）处取最大值
$$z=4^{3}-48=16 .$$

**比较**：$\max\{0,\ -4,\ 16\}=16$。故
$$z_{\max}=16 ,$$
在点 $(4,0)$ 处取得。

@考点
闭区域上连续函数最值的求法（内部驻点 $+$ 边界最值，最后比较）；边界上用约束消元降维；一元函数在闭区间上的最值。

易混：内部驻点只需算函数值，不必判别极值类型；而边界上要在**闭区间**上求最值，端点也要考虑（本题边界是闭曲线，$x\in[-4,4]$ 的端点 $x=\pm4$ 对应 $y=0$，已包含在讨论中）。

@易错
1. 只求内部驻点，忘记边界。
2. 边界上用拉格朗日乘数法（可行，但本题消元后是单调函数，直接得出结论更快）。
3. 代入边界时漏掉 $-3y^{2}$ 这一项的符号。
4. 认为最大值一定在驻点取得。

[13]
@题目
设 $f(u)$ 在 $(0, +\infty)$ 内具有二阶导数，$z = xf(\frac{y}{x}) + yf(\frac{y}{x})$ 满足
$$x\frac{\partial^2 z}{\partial x \partial y} + 2y\frac{\partial^2 z}{\partial y^2} = \frac{y}{x}, \quad z(x, x) = x, \quad \frac{\partial z}{\partial x}\Big|_{(x,x)} = -\frac{3}{2}.$$
求 $f(u)$.

@切入点
$z=xf(u)+yf(u)=(x+y)f(u)$（$u=\frac yx$），所以先把 $z$ 写成这个紧凑形式，再求偏导，能少写一半。

这是"把偏微分方程化成常微分方程"的典型题，路线是：算出 $z_{xy}$ 与 $z_{yy}$，代入方程，整理后应当只剩 $u$。整理时的检验点是：**所有 $x,y$ 必须能合并成 $u$ 的函数**，否则说明算错了。本题整理结果
$$x\frac{\partial^{2}z}{\partial x\partial y}+2y\frac{\partial^{2}z}{\partial y^{2}}=2uf'(u)+u(1+u)f''(u)=u ,$$
两边除以 $u$（$u\neq0$）得
$$(1+u)f''(u)+2f'(u)=1 .$$

解这个方程不要套二阶公式，先降阶：令 $p=f'$，得一阶线性方程 $(1+u)p'+2p=1$。再注意乘上 $(1+u)$ 后左端成为恰当导数：
$$[(1+u)^{2}p]'=(1+u)^{2}p'+2(1+u)p=(1+u) ,$$
一次积分即得 $p$。这个"配积分因子 $(1+u)$"的技巧与前面几道题同源。

最后两个定解条件都在 $y=x$（即 $u=1$）处给出，分别定出 $f(1)$ 与 $f'(1)$，进而定出两个常数。注意 $z'_x$ 的表达式里要代 $u=1$，别漏掉链式法则产生的项。

@解答
记 $u=\dfrac yx$，则 $z=(x+y)f(u)$，$u_x=-\dfrac{y}{x^{2}}$，$u_y=\dfrac1x$。计算
$$\frac{\partial z}{\partial x}=f(u)-\frac{(x+y)y}{x^{2}}f'(u),  \frac{\partial z}{\partial y}=f(u)+\frac{x+y}{x}f'(u) ,$$
$$\frac{\partial^{2}z}{\partial y^{2}}=\frac{2}{x}f'(u)+\frac{x+y}{x^{2}}f''(u), 
\frac{\partial^{2}z}{\partial x\partial y}=\frac{f'(u)}{x}-\frac{(x+2y)f'(u)}{x^{2}}-\frac{(xy+y^{2})f''(u)}{x^{3}} .$$
代入并整理（$f'$ 的系数为 $\frac{2y}{x}$，$f''$ 的系数为 $\frac{y(x+y)}{x^{2}}$）：
$$x\frac{\partial^{2}z}{\partial x\partial y}+2y\frac{\partial^{2}z}{\partial y^{2}}=\frac{2y}{x}f'(u)+\frac{y(x+y)}{x^{2}}f''(u)=2uf'(u)+u(1+u)f''(u) .$$
令其等于 $\dfrac yx=u$ 并约去 $u$：
$$(1+u)f''(u)+2f'(u)=1 .$$

令 $p=f'(u)$，则 $(1+u)p'+2p=1$。两边乘 $(1+u)$：
$$[(1+u)^{2}p]'=1+u\Longrightarrow (1+u)^{2}p=\frac{(1+u)^{2}}{2}+C\Longrightarrow p=\frac12+\frac{C}{(1+u)^{2}} ,$$
再积分
$$f(u)=\frac u2-\frac{C}{1+u}+D .$$

由 $z(x,x)=2xf(1)=x$ 得 $f(1)=\dfrac12$；由
$$\frac{\partial z}{\partial x}|_{(x,x)}=f(1)-\frac{2x\cdot x}{x^{2}}f'(1)=f(1)-2f'(1)=-\frac32$$
得 $f'(1)=1$。代入 $p(1)=\dfrac12+\dfrac C4=1$ 得 $C=2$；再由 $f(1)=\dfrac12-\dfrac22+D=\dfrac12$ 得 $D=1$。故
$$f(u)=\frac u2-\frac{2}{1+u}+1 .$$

@考点
多元复合函数的二阶偏导；把偏微分方程化为常微分方程；可降阶方程与积分因子 $[(1+u)^{2}p]'$；由定解条件确定常数。

易混：$z(x,x)=x$ 给出的是 $f(1)$ 的值；$\frac{\partial z}{\partial x}|_{(x,x)}$ 是"先对 $x$ 求偏导再代 $y=x$"，不是"先令 $y=x$ 再对 $x$ 求导"（后者是全导数，会多一项）。这是本题最隐蔽的坑。

@易错
1. 不把 $z$ 写成 $(x+y)f(u)$，分别对两项求导导致计算翻倍。
2. 求 $z_{xy}$ 时漏项（对 $x$ 求导后再对 $y$ 求导要用乘积法则）。
3. 混淆 $\frac{\partial z}{\partial x}|_{(x,x)}$ 与 $\frac{d}{dx}z(x,x)$。
4. 解 $(1+u)p'+2p=1$ 时用错积分因子。

[14]
@题目
若 $A^{n} = E$，$n$ 为正整数，则 $(A^{*})^{n} = \underline{\hspace{2cm}}$.

@切入点
条件 $A^{n}=E$ 给出两条信息：
1. $A$ **可逆**（因为 $A\cdot A^{n-1}=E$），且 $A^{-1}=A^{n-1}$；
2. 两边取行列式得 $|A|^{n}=1$。

要求 $(A^{*})^{n}$，把伴随换成逆是标准动作：
$$A^{*}=|A|A^{-1} .$$
于是
$$(A^{*})^{n}=|A|^{n}(A^{-1})^{n}=1\cdot(A^{n})^{-1}=E^{-1}=E .$$
这里用到 $(A^{-1})^{n}=(A^{n})^{-1}$，以及第 2 条给出的 $|A|^{n}=1$——**$|A|$ 本身未必等于 $1$**（例如 $n$ 为偶数时可以是 $-1$），但它的 $n$ 次方一定是 $1$，这正好配上式子里的 $n$ 次方。看清这一点是本题唯一的思考量。

@解答
由 $A^{n}=E$ 知 $A$ 可逆（$A\cdot A^{n-1}=E$），且两边取行列式得
$$|A|^{n}=|E|=1 .$$
又 $A^{*}=|A|A^{-1}$，故
$$(A^{*})^{n}=(|A|A^{-1})^{n}=|A|^{n}(A^{-1})^{n}=1\cdot(A^{n})^{-1}=E^{-1}=E .$$
即
$$(A^{*})^{n}=E .$$

@考点
伴随矩阵与逆矩阵的关系 $A^{*}=|A|A^{-1}$（$A$ 可逆时）；$|A^{n}|=|A|^{n}$；$(A^{-1})^{n}=(A^{n})^{-1}$；数量因子可以从矩阵幂中提出。

易混：由 $|A|^{n}=1$ 不能推出 $|A|=1$（实数范围内 $n$ 为偶数时 $|A|=\pm1$）；但本题只用到 $|A|^{n}$，不受影响。

@易错
1. 直接认定 $|A|=1$。
2. 把 $A^{*}$ 写成 $A^{-1}$（漏掉因子 $|A|$）。
3. $(A^{-1})^{n}$ 与 $(A^{n})^{-1}$ 的关系搞错。
4. 试图具体求 $A^{*}$。

[15]
@题目
设 $(X,Y) \sim N(1,1,2,2;0)$，$U = X + 2Y$，$V = X - 2Y$，则
$$\rho_{UV} = \underline{\qquad\qquad}$$

@切入点
$U,V$ 都是 $X,Y$ 的线性组合，所以只需把 $\mathrm{Cov}$、$DU$、$DV$ 用 $DX,DY,\mathrm{Cov}(X,Y)$ 表示出来，再代公式
$$\rho_{UV}=\frac{\mathrm{Cov}(U,V)}{\sqrt{DU}\sqrt{DV}} .$$

题设 $\rho=0$ 使 $\mathrm{Cov}(X,Y)=0$（二维正态时还蕴含独立，但这里只需不相关），于是三个量都只由 $DX=DY=2$ 决定：
$$\mathrm{Cov}(U,V)=\mathrm{Cov}(X+2Y,X-2Y)=DX-4DY ,$$
$$DU=DX+4DY,  DV=DX+4DY .$$
注意 $DV$ 中 $(-2)^{2}=4$ 仍是**加**，这是最容易错的一处：**减法的方差也是相加**。

按记号 $N(\mu_1,\mu_2,\sigma_1^{2},\sigma_2^{2};\rho)=N(1,1,2,2;0)$，即 $DX=DY=2$。代入得 $\mathrm{Cov}(U,V)=2-8=-6$，$DU=DV=10$，故 $\rho_{UV}=-\frac{6}{10}=-\frac35$。

@解答
由记号 $(X,Y)\sim N(1,1,2,2;0)$ 知 $EX=EY=1$，$DX=DY=2$，$\rho=0$，故 $\mathrm{Cov}(X,Y)=0$。

$$\mathrm{Cov}(U,V)=\mathrm{Cov}(X+2Y,\ X-2Y)=DX-2\mathrm{Cov}(X,Y)+2\mathrm{Cov}(Y,X)-4DY=DX-4DY=2-8=-6 ,$$
$$DU=D(X+2Y)=DX+4DY=2+8=10,  DV=D(X-2Y)=DX+4DY=10 .$$
故
$$\rho_{UV}=\frac{\mathrm{Cov}(U,V)}{\sqrt{DU\cdot DV}}=\frac{-6}{\sqrt{10\times10}}=-\frac{6}{10}=-\frac35 .$$

@考点
协方差的双线性性；$D(aX+bY)=a^{2}DX+b^{2}DY+2ab \mathrm{Cov}(X,Y)$；相关系数的定义；二维正态记号中参数的含义。

易混：$D(X-2Y)=DX+4DY$（独立时），系数平方后恒为正；只有协方差项的符号会随 $a,b$ 的符号改变。

@易错
1. $DV$ 算成 $DX-4DY=-6<0$。
2. 把记号读成 $N(\mu_1,\sigma_1^{2},\mu_2,\sigma_2^{2};\rho)$，参数对错位。
3. 相关系数忘记开方（分母是标准差之积）。
4. 计算 $\mathrm{Cov}(U,V)$ 时把两个交叉项写成不抵消的形式。

[16]
@题目
求
$$\sum_{n=1}^{\infty} \frac{x^n}{n[3^n + (-2)^n]}$$
的收敛区间，并讨论在端点处的敛散性.

@切入点
系数 $a_n=\dfrac{1}{n[3^{n}+(-2)^{n}]}$ 里有两个指数项，求收敛半径时的关键是**抓主项**：当 $n$ 较大时 $3^{n}$ 远大于 $|(-2)^{n}|$，所以
$$3^{n}+(-2)^{n}=3^{n}[1+(-\frac23)^{n}],  (-\frac23)^{n}\to0 ,$$
于是 $\sqrt[n]{|a_n|}\to\dfrac13$，收敛半径 $R=3$。用比值法也可以，但根值法在这里更干净。

把 $3^{n}+(-2)^{n}$ **提出 $3^{n}$** 这一步不仅用于求半径，在端点讨论时同样是主力：

- $x=3$：通项 $=\dfrac{1}{n[1+(-\frac23)^{n}]}$，当 $n$ 大时它与 $\dfrac1n$ **等价**（正项），由比较判别法发散。
- $x=-3$：通项 $=\dfrac{(-1)^{n}}{n[1+(-\frac23)^{n}]}$。这里不能直接用莱布尼茨判别法（因为 $\frac{1}{n[1+(-2/3)^n]}$ 未必单调），正确的办法是**把它拆成两部分**：
$$\frac{1}{1+q_n}=1-q_n+O(q_n^{2}) (q_n=(-\tfrac23)^{n}) ,$$
于是通项 $=\dfrac{(-1)^{n}}{n}-\dfrac{(2/3)^{n}}{n}+O(\dfrac{(4/9)^{n}}{n})$。第一部分是收敛的交错级数，后两部分绝对收敛，故整体收敛。

"拆成主部 $+$ 绝对收敛的余项"是处理这种端点的标准手法。

@解答
记 $a_n=\dfrac{1}{n[3^{n}+(-2)^{n}]}$。由
$$3^{n}+(-2)^{n}=3^{n}[1+(-\frac23)^{n}],  (-\frac23)^{n}\to0 ,$$
得 $\sqrt[n]{|a_n|}=\dfrac{1}{\sqrt[n]{n}\cdot3\sqrt[n]{|1+(-\frac23)^{n}|}}\to\dfrac13$，故收敛半径 $R=3$，**收敛区间为 $(-3,3)$**。

**端点 $x=3$**：通项为
$$\frac{3^{n}}{n[3^{n}+(-2)^{n}]}=\frac{1}{n[1+(-\frac23)^{n}]}\sim\frac1n (n\to\infty) ,$$
为正项且与 $\dfrac1n$ 等价，由比较判别法，级数**发散**。

**端点 $x=-3$**：通项为
$$\frac{(-3)^{n}}{n[3^{n}+(-2)^{n}]}=\frac{(-1)^{n}}{n[1+q_n]},  q_n=(-\frac23)^{n} .$$
由 $\dfrac{1}{1+q_n}=1-q_n+\dfrac{q_n^{2}}{1+q_n}$ 得
$$\frac{(-1)^{n}}{n[1+q_n]}=\frac{(-1)^{n}}{n}-\frac{(-1)^{n}q_n}{n}+\frac{(-1)^{n}q_n^{2}}{n(1+q_n)}=\frac{(-1)^{n}}{n}-\frac{(2/3)^{n}}{n}+O(\frac{(4/9)^{n}}{n}) .$$
其中 $\sum\dfrac{(-1)^{n}}{n}$ 收敛（莱布尼茨），$\sum\dfrac{(2/3)^{n}}{n}$ 与余项级数都绝对收敛，故级数**收敛**（且为条件收敛）。

综上，收敛域为 $[-3,3)$。

@考点
幂级数收敛半径的根值法；指数和中提取主项 $3^{n}+(-2)^{n}=3^{n}[1+(-\frac23)^{n}]$；端点处的敛散性判别；把一般项拆成"交错主部 $+$ 绝对收敛余项"。

易混：莱布尼茨判别法要求 $|u_n|$ **单调**趋于零；本题 $x=-3$ 处的 $\frac{1}{n[1+q_n]}$ 不保证单调，所以必须用拆分法而不能直接套莱布尼茨。

@易错
1. 忽略 $(-2)^{n}$，把系数直接当成 $\frac{1}{n3^{n}}$（结论虽同，但端点判别不严格）。
2. $x=-3$ 处直接套莱布尼茨判别法而不验证单调性。
3. 把收敛区间与收敛域混为一谈（前者是开区间，后者要含端点讨论）。
4. $x=3$ 处误以为交错从而判收敛。

[17]
@题目
设 $D$ 是以 $(1,1)$、$(-1,1)$ 和 $(-1,-1)$ 为顶点的三角形区域，$D_1$ 是 $D$ 在第一象限的部分，且
$$f(x,y)=xy+\iint_{D}f(x,y)\mathrm{d}x\mathrm{d}y,$$
其中 $f(x,y)$ 在 $D$ 上连续，则（　）.
A. $\displaystyle\iint_{D}f(x,y)\mathrm{d}x\mathrm{d}y=\iint_{D_1}f(x,y)\mathrm{d}x\mathrm{d}y$
B. $\displaystyle\iint_{D}f(x,y)\mathrm{d}x\mathrm{d}y=2\iint_{D_1}f(x,y)\mathrm{d}x\mathrm{d}y$
C. $\displaystyle\iint_{D}f(x,y)\mathrm{d}x\mathrm{d}y=\iint_{D}f(y,x)\mathrm{d}x\mathrm{d}y$
D. $\displaystyle\iint_{D}f(x,y)\mathrm{d}x\mathrm{d}y=2\iint_{D_1}f(y,x)\mathrm{d}x\mathrm{d}y$

@切入点
方程
$$f(x,y)=xy+\iint_Df(x,y)dxdy$$
右端的二重积分是一个**常数**（积分变量是哑变量，积完就没有 $x,y$ 了）。所以第一动作和"含定积分的函数方程"一样：**设这个常数为 $A$**，则 $f(x,y)=xy+A$，再把它代回 $A$ 的定义式解出 $A$：
$$A=\iint_D(xy+A)d\sigma=\iint_Dxy d\sigma+A\cdot S_D .$$

要用到两个几何量：
- $D$ 是以 $(1,1),(-1,1),(-1,-1)$ 为顶点的直角三角形，两直角边长都是 $2$，面积 $S_D=2$；它的斜边是直线 $y=x$，区域可写成 $\{-1\leqslant x\leqslant1,\ x\leqslant y\leqslant1\}$。
- $\displaystyle\iint_Dxy d\sigma=\int_{-1}^{1}x\cdot\frac{1-x^{2}}{2}dx=0$（被积函数 $\frac{x-x^{3}}{2}$ 是奇函数，区间对称）。

于是 $A=0+2A$，得 $A=0$，从而 $f(x,y)=xy$。有了 $f$ 的显式表达式，四个选项就可以逐一验算了。注意 $D$ **并不**关于 $y=x$ 对称（它整个在 $y\geqslant x$ 一侧），所以不能指望用对称性一步判断；但 $f(x,y)=xy$ 本身关于 $x,y$ 对称，$f(y,x)=f(x,y)$，C 自动成立。

@解答
记 $A=\displaystyle\iint_Df(x,y)dxdy$（常数），则 $f(x,y)=xy+A$。

$D$ 是以 $(1,1),(-1,1),(-1,-1)$ 为顶点的三角形，即
$$D=\{(x,y):-1\leqslant x\leqslant1,\ x\leqslant y\leqslant1\} ,$$
面积 $S_D=\dfrac12\cdot2\cdot2=2$。又
$$\iint_Dxy d\sigma=\int_{-1}^{1}x[\int_{x}^{1}y dy]dx=\int_{-1}^{1}x\cdot\frac{1-x^{2}}{2}dx=\frac12\int_{-1}^{1}(x-x^{3})dx=0$$
（被积函数为奇函数，积分区间对称）。于是
$$A=\iint_D(xy+A)d\sigma=0+2A\Longrightarrow A=0 ,$$
故
$$f(x,y)=xy,  \iint_Df d\sigma=0 .$$

逐一检验选项（$D_1=\{0\leqslant x\leqslant1,\ x\leqslant y\leqslant1\}$）：
$$\iint_{D_1}f d\sigma=\int_{0}^{1}x\cdot\frac{1-x^{2}}{2}dx=\frac12(\frac12-\frac14)=\frac18\neq0 ,$$
故 A、B 均不成立；又 $\displaystyle\iint_{D_1}f(y,x)d\sigma=\iint_{D_1}xy d\sigma=\frac18$，$2\cdot\frac18=\frac14\neq0$，D 不成立。

而 $f(y,x)=yx=f(x,y)$，故
$$\iint_Df(y,x)dxdy=\iint_Df(x,y)dxdy ,$$
C 成立。选 **C**。

@考点
含二重积分的函数方程（设常数法）；三角形区域的描述与面积；奇函数在对称区间上积分为零；二重积分的对称性判断。

易混：$D$ 关于直线 $y=x$ **不对称**（它整个位于 $y\geqslant x$ 一侧），所以 C 的成立不是靠区域对称，而是靠 $f$ 本身关于 $x,y$ 对称。

@易错
1. 把 $\iint_Df d\sigma$ 当成 $x,y$ 的函数。
2. 三角形面积算成 $4$ 或 $1$。
3. 区域描述写错（例如写成 $-1\leqslant y\leqslant x$）。
4. 求出 $A=0$ 后不验算各选项，凭感觉选 B。

[18]
@题目
设随机变量 $X$ 和 $Y$ 都在 $[a,b]$ 上服从均匀分布，且 $X$ 与 $Y$ 相互独立. 求：
（Ⅰ）$Z_1=\max\{X,Y\}$ 和 $Z_2=\min\{X,Y\}$ 的概率密度；
（Ⅱ）$(Z_1,Z_2)$ 的联合概率密度.

@切入点
求 $\max$ 与 $\min$ 的分布，**永远从分布函数入手**，因为最大值、最小值与分布函数有天然的联系：
$$\{ \max\{X,Y\}\leqslant z\}=\{X\leqslant z\}\cap\{Y\leqslant z\},  \{\min\{X,Y\}>z\}=\{X>z\}\cap\{Y>z\} .$$
独立时右端概率可以相乘，于是
$$F_{Z_1}(z)=[F(z)]^{2},  1-F_{Z_2}(z)=[1-F(z)]^{2} .$$
求导即得两个密度。注意 $\min$ 要用"**大于**"来写才能相乘，直接对 $\{\min\leqslant z\}$ 下手会麻烦。

（Ⅱ）联合密度可以用一个直观的办法得到：事件"$(Z_1,Z_2)$ 落在 $(z_1,z_2)$ 附近"（其中 $z_2<z_1$）对应原来的两种情形——"$X$ 在 $z_1$ 附近、$Y$ 在 $z_2$ 附近"或"$X$ 在 $z_2$ 附近、$Y$ 在 $z_1$ 附近"。两种情形概率相同，故
$$f_{Z_1Z_2}(z_1,z_2)=2f(z_1)f(z_2)=\frac{2}{(b-a)^{2}} (a\leqslant z_2<z_1\leqslant b) ,$$
其余为零。那个因子 $2$ 就是"$2!$ 种排列"的体现，是次序统计量联合密度的通用规律。

@解答
设 $X,Y$ 的公共分布函数与密度为
$$F(x)=\frac{x-a}{b-a},  f(x)=\frac{1}{b-a} (a\leqslant x\leqslant b) .$$

（Ⅰ）**$Z_1=\max\{X,Y\}$**：由独立性
$$F_{Z_1}(z)=P\{X\leqslant z,Y\leqslant z\}=[F(z)]^{2}=\frac{(z-a)^{2}}{(b-a)^{2}} (a\leqslant z\leqslant b) ,$$
求导得
$$f_{Z_1}(z)=\begin{cases}\dfrac{2(z-a)}{(b-a)^{2}},&a\leqslant z\leqslant b,\\ 0,&\text{其他} .\end{cases}$$

**$Z_2=\min\{X,Y\}$**：
$$1-F_{Z_2}(z)=P\{X>z,Y>z\}=[1-F(z)]^{2}=\frac{(b-z)^{2}}{(b-a)^{2}} (a\leqslant z\leqslant b) ,$$
求导得
$$f_{Z_2}(z)=\begin{cases}\dfrac{2(b-z)}{(b-a)^{2}},&a\leqslant z\leqslant b,\\ 0,&\text{其他} .\end{cases}$$

（Ⅱ）当 $a\leqslant z_2<z_1\leqslant b$ 时，$(Z_1,Z_2)=(z_1,z_2)$ 对应 $(X,Y)=(z_1,z_2)$ 或 $(z_2,z_1)$ 两种情形，故
$$f_{Z_1Z_2}(z_1,z_2)=2f(z_1)f(z_2)=\frac{2}{(b-a)^{2}} ,$$
即
$$f_{Z_1Z_2}(z_1,z_2)=\begin{cases}\dfrac{2}{(b-a)^{2}},&a\leqslant z_2<z_1\leqslant b,\\[4pt] 0,&\text{其他} .\end{cases}$$

@考点
最大值与最小值的分布函数公式 $F_{\max}=[F]^{n}$、$1-F_{\min}=[1-F]^{n}$（独立同分布情形）；次序统计量的联合密度（含排列因子 $n!$）；均匀分布。

易混：求 $\min$ 的分布必须从 $P\{\min>z\}$ 入手；若直接写 $P\{\min\leqslant z\}=P\{X\leqslant z\ \text{或}\ Y\leqslant z\}$，就要用容斥公式，更麻烦。

@易错
1. $f_{Z_1}$ 与 $f_{Z_2}$ 的表达式弄反（$\max$ 的密度随 $z$ 增大而增大）。
2. 联合密度漏掉因子 $2$。
3. 联合密度的定义域写成 $a\leqslant z_1<z_2\leqslant b$（次序反了）。
4. 忘记 $(Z_1,Z_2)$ 只在半个正方形上取值（$Z_1\geqslant Z_2$）。

[19]
@题目
设 $f(x)$ 在 $[-1,1]$ 上二阶可导，且 $f''(x)>0$，$\displaystyle\int_{-1}^{1}f(x)\,\mathrm{d}x=2$，则 $f(0)$ 的取值范围为（　）.
A. $(-\infty,0]$　　B. $(0,+\infty)$　　C. $(-\infty,1)$　　D. $(1,+\infty)$

@切入点
条件 $f''>0$ 说明 $f$ 是**凸函数**（下凸），凸函数最有用的性质是"图形位于任一切线之上"：
$$f(x)\geqslant f(x_0)+f'(x_0)(x-x_0) ,$$
且当 $f''>0$ 严格成立时，$x\neq x_0$ 处是严格不等号。

题目给的是 $\displaystyle\int_{-1}^{1}f=2$，要估计 $f(0)$——注意积分区间关于 $0$ **对称**，而切线在 $x_0=0$ 处的表达式是 $f(0)+f'(0)x$，其中的一次项 $f'(0)x$ 在对称区间上积分恰好为 $0$！这正是选 $x_0=0$ 作切点的理由：
$$2=\int_{-1}^{1}f(x)dx>\int_{-1}^{1}[f(0)+f'(0)x]dx=2f(0)+0 ,$$
立刻得到 $f(0)<1$。

最后还要说明 $(-\infty,1)$ 中每个值都能取到（否则只证明了必要性）：取 $f(x)=c+kx^{2}$（$k>0$）满足 $f''>0$，由 $\int_{-1}^1f=2c+\frac{2k}{3}=2$ 得 $f(0)=c=1-\frac k3$，当 $k$ 取遍 $(0,+\infty)$ 时 $f(0)$ 取遍 $(-\infty,1)$。

@解答
因 $f''(x)>0$，$f$ 在 $[-1,1]$ 上严格凸，故对 $x\neq0$ 有
$$f(x)>f(0)+f'(0)x .$$
在 $[-1,1]$ 上积分（注意 $\displaystyle\int_{-1}^{1}x dx=0$）：
$$2=\int_{-1}^{1}f(x)dx>\int_{-1}^{1}[f(0)+f'(0)x]dx=2f(0) ,$$
故
$$f(0)<1 .$$

反之，对任意 $c<1$，取 $k=3(1-c)>0$ 与 $f(x)=c+kx^{2}$，则 $f''=2k>0$，且
$$\int_{-1}^{1}(c+kx^{2})dx=2c+\frac{2k}{3}=2c+2(1-c)=2 ,$$
而 $f(0)=c$。故 $f(0)$ 可取遍 $(-\infty,1)$。

综上 $f(0)\in(-\infty,1)$，选 **C**。

@考点
凸函数的切线不等式 $f(x)\geqslant f(x_0)+f'(x_0)(x-x_0)$；对称区间上奇函数积分为零；取值范围问题要同时给出"必要性（上界）"与"可达性（构造）"。

易混：$f''>0$ 对应"下凸（凸函数）"，图形在切线之上、在割线之下；若用割线不等式（$f$ 在端点连线之下）会得到关于 $f(\pm1)$ 的信息，与本题要的 $f(0)$ 对不上。

@易错
1. 选错切点（用 $x_0\neq0$ 时一次项积分不为零，估不出干净的结论）。
2. 只证 $f(0)<1$ 不说明可达性，从而在 C 与 A 之间犹豫。
3. 把不等号方向弄反（凸函数在切线**上**方）。
4. 误用 $f''>0\Rightarrow f>0$。

[20]
@题目
设 $X$ 与 $Y$ 满足：$EX=-2$，$EY=2$，$DX=1$，$DY=4$，$\rho_{XY}=-\dfrac{1}{2}$，则根据切比雪夫不等式，有
$$P\{|X+Y|\geqslant6\}\leqslant\underline{\hspace{3em}}.$$

@切入点
切比雪夫不等式
$$P\{|X-EX|\geqslant\varepsilon\}\leqslant\frac{DX}{\varepsilon^{2}}$$
需要三样东西：随机变量、它的期望、它的方差。本题的随机变量是 $X+Y$，所以：

1. $E(X+Y)=EX+EY=-2+2=0$——恰好为零，于是 $|X+Y|$ 就是 $|X+Y-E(X+Y)|$，可以直接套公式，这是题目把期望设成相反数的用意。
2. $D(X+Y)=DX+DY+2\mathrm{Cov}(X,Y)$，而
$$\mathrm{Cov}(X,Y)=\rho_{XY}\sqrt{DX}\sqrt{DY}=(-\frac12)\cdot1\cdot2=-1 ,$$
故 $D(X+Y)=1+4-2=3$。**注意 $X,Y$ 不独立，协方差项不能丢**，这是本题的主要考点。
3. $\varepsilon=6$，代入即可。

@解答
$$E(X+Y)=EX+EY=-2+2=0 .$$
由 $\mathrm{Cov}(X,Y)=\rho_{XY}\sqrt{DX}\sqrt{DY}=(-\dfrac12)\cdot\sqrt1\cdot\sqrt4=-1$，
$$D(X+Y)=DX+DY+2\mathrm{Cov}(X,Y)=1+4+2(-1)=3 .$$
由切比雪夫不等式（取 $\varepsilon=6$）：
$$P\{|X+Y|\geqslant6\}=P\{|(X+Y)-E(X+Y)|\geqslant6\}\leqslant\frac{D(X+Y)}{6^{2}}=\frac{3}{36}=\frac{1}{12} .$$

@考点
切比雪夫不等式；和的方差公式 $D(X+Y)=DX+DY+2\mathrm{Cov}(X,Y)$；相关系数与协方差的关系 $\mathrm{Cov}=\rho\sigma_X\sigma_Y$。

易混：只有**独立（或不相关）**时才有 $D(X+Y)=DX+DY$；本题 $\rho\neq0$，必须加协方差项。

@易错
1. 漏掉协方差项，算成 $D=5$，答 $\frac{5}{36}$。
2. $\mathrm{Cov}$ 用成 $\rho\cdot DX\cdot DY$（应是标准差之积）。
3. 忘记先检查 $E(X+Y)=0$，直接把 $|X+Y|$ 当成偏差。
4. $\varepsilon^{2}$ 写成 $6$。

[21]
@题目
设立体 $\Omega$ 由曲面 $\Sigma:x^2+y^2=-2x(z-1)\ (0\leqslant z\leqslant 1)$ 与平面 $z=0$ 围成，$\Omega$ 的密度 $\rho=1$．
（Ⅰ）求 $\Omega$ 的形心坐标 $\bar x$．

@切入点
曲面 $x^{2}+y^{2}=-2x(z-1)=2x(1-z)$ 形状不直观，先**解出 $z$**：
$$z=1-\frac{x^{2}+y^{2}}{2x} ,$$
再换极坐标立刻清晰：
$$z=1-\frac{r^{2}}{2r\cos\theta}=1-\frac{r}{2\cos\theta} .$$
于是在每条极角射线上，$z$ 是 $r$ 的一次函数：$r=0$ 时 $z=1$，$r=2\cos\theta$ 时 $z=0$。所以立体 $\Omega$ 的底面（$z=0$）正是圆 $x^{2}+y^{2}=2x$，顶点在 $(0,0,1)$，是一个"斜放的锥状体"。

求形心 $\overline x=\dfrac{\iiint_\Omega x dV}{\iiint_\Omega dV}$，两个三重积分都用**先 $z$ 后极坐标**（即"先一后二"）：固定 $(r,\theta)$ 时 $z$ 从 $0$ 到 $1-\frac{r}{2\cos\theta}$，高度已经写好，于是
$$\iiint_\Omega g dV=\iint_{D}g\cdot h(r,\theta) r drd\theta,  h=1-\frac{r}{2\cos\theta} .$$
这样两个积分的内层都是关于 $r$ 的多项式，外层是 $\cos^{k}\theta$ 的积分，用华里士公式收尾。

@解答
化极坐标：由 $x^{2}+y^{2}=2x(1-z)$ 得
$$z=1-\frac{r}{2\cos\theta} ,$$
故 $z\geqslant0$ 要求 $r\leqslant2\cos\theta$，且 $-\dfrac\pi2\leqslant\theta\leqslant\dfrac\pi2$。立体的高
$$h(r,\theta)=1-\frac{r}{2\cos\theta} .$$

**体积**：
$$V=\int_{-\frac\pi2}^{\frac\pi2}\int_{0}^{2\cos\theta}(1-\frac{r}{2\cos\theta})r drd\theta .$$
内层
$$\int_{0}^{2\cos\theta}(r-\frac{r^{2}}{2\cos\theta})dr=\frac{(2\cos\theta)^{2}}{2}-\frac{(2\cos\theta)^{3}}{6\cos\theta}=2\cos^{2}\theta-\frac43\cos^{2}\theta=\frac23\cos^{2}\theta ,$$
故
$$V=\frac23\int_{-\frac\pi2}^{\frac\pi2}\cos^{2}\theta d\theta=\frac23\cdot\frac\pi2=\frac\pi3 .$$

**一次矩**：
$$\iiint_\Omega x dV=\int_{-\frac\pi2}^{\frac\pi2}\int_{0}^{2\cos\theta}(1-\frac{r}{2\cos\theta})r\cos\theta\cdot r drd\theta .$$
内层
$$\int_{0}^{2\cos\theta}(r^{2}\cos\theta-\frac{r^{3}}{2})dr=\cos\theta\cdot\frac{8\cos^{3}\theta}{3}-\frac{16\cos^{4}\theta}{8}=\frac83\cos^{4}\theta-2\cos^{4}\theta=\frac23\cos^{4}\theta ,$$
故
$$\iiint_\Omega x dV=\frac23\int_{-\frac\pi2}^{\frac\pi2}\cos^{4}\theta d\theta=\frac23\cdot2\cdot\frac{3\pi}{16}=\frac\pi4 .$$

因此
$$\overline x=\frac{\iiint_\Omega x dV}{V}=\frac{\pi/4}{\pi/3}=\frac34 .$$

（注：原始摘录中本题只保留了第（Ⅰ）问，后续小问缺失。）

@考点
柱坐标（极坐标 $+$ 高）下的三重积分"先一后二"法；形心公式 $\overline x=\frac{\iiint x dV}{\iiint dV}$；$\int_0^{\frac\pi2}\cos^{2}\theta d\theta=\frac\pi4$、$\int_0^{\frac\pi2}\cos^{4}\theta d\theta=\frac{3\pi}{16}$（华里士公式）。

易混：$\theta$ 的范围由 $r\leqslant2\cos\theta\geqslant0$ 决定，必须限制在 $[-\frac\pi2,\frac\pi2]$，否则 $\cos\theta<0$ 会出现负半径。

@易错
1. 不解出 $z$ 就试图在直角坐标下定限。
2. 忘记极坐标体积元中的 $r$（"先一后二"时是 $h\cdot r drd\theta$）。
3. $\theta$ 取成 $[0,2\pi]$。
4. 华里士公式的系数记错（$\cos^{4}$ 在 $[0,\frac\pi2]$ 上的积分是 $\frac34\cdot\frac12\cdot\frac\pi2$）。

[22]
@题目
设 $a>0$，$\displaystyle\lim_{x\to+\infty}x^{a}\ln\frac{\arctan(x+1)}{\arctan x}=b$，则（　）.
A. $a=2,\ b=\frac{2}{\pi}$　　B. $a=2,\ b=\frac{\pi}{2}$　　C. $a=1,\ b=\frac{2}{\pi}$　　D. $a=1,\ b=\frac{\pi}{2}$

@切入点
$x\to+\infty$ 时 $\dfrac{\arctan(x+1)}{\arctan x}\to1$，所以 $\ln(\cdots)\to0$，而 $x^{a}\to+\infty$，是 $\infty\cdot0$ 型。要定出 $a$，就必须知道那个对数是**几阶**无穷小。

处理步骤：
1. 先把对数写成 $\ln(1+u)$ 的形式：
$$\ln\frac{\arctan(x+1)}{\arctan x}=\ln(1+\frac{\arctan(x+1)-\arctan x}{\arctan x}) ,$$
再用 $\ln(1+u)\sim u$。
2. 估计分子 $\arctan(x+1)-\arctan x$ 的阶。最快的是**拉格朗日中值定理**：
$$\arctan(x+1)-\arctan x=\frac{1}{1+\xi^{2}} (\xi\in(x,x+1)) ,$$
而 $\xi\sim x$，故它 $\sim\dfrac{1}{x^{2}}$——**二阶**无穷小。
3. 分母 $\arctan x\to\dfrac\pi2$ 是非零常数。

于是整个对数 $\sim\dfrac{2}{\pi x^{2}}$，要使 $x^{a}\cdot\dfrac{2}{\pi x^{2}}$ 有非零极限，必须 $a=2$，此时 $b=\dfrac2\pi$。

这里"用中值定理估计两个 $\arctan$ 之差"是关键技巧；若用 $\arctan$ 的差角公式 $\arctan(x+1)-\arctan x=\arctan\frac{1}{1+x(x+1)}$ 也可以，同样得到 $\sim\frac{1}{x^{2}}$。

@解答
当 $x\to+\infty$ 时 $\dfrac{\arctan(x+1)}{\arctan x}\to1$。记
$$u=\frac{\arctan(x+1)-\arctan x}{\arctan x} ,$$
则 $u\to0$，且
$$\ln\frac{\arctan(x+1)}{\arctan x}=\ln(1+u)\sim u .$$

由拉格朗日中值定理，存在 $\xi\in(x,x+1)$ 使
$$\arctan(x+1)-\arctan x=\frac{1}{1+\xi^{2}}\sim\frac{1}{x^{2}} (x\to+\infty) ,$$
又 $\arctan x\to\dfrac\pi2$，故
$$u\sim\frac{1/x^{2}}{\pi/2}=\frac{2}{\pi x^{2}} .$$
于是
$$x^{a}\ln\frac{\arctan(x+1)}{\arctan x}\sim\frac{2}{\pi}x^{a-2} .$$
极限 $b$ 存在且（由选项）非零，必须 $a-2=0$，即
$$a=2,  b=\frac2\pi .$$
选 **A**。

@考点
$\infty\cdot0$ 型未定式的定阶；$\ln(1+u)\sim u$；用拉格朗日中值定理估计函数差的阶；$\arctan x\to\frac\pi2$。

易混：$\arctan(x+1)-\arctan x$ 的阶是 $\frac{1}{x^{2}}$ 而不是常数或 $\frac1x$——因为 $\arctan$ 的导数在无穷远处是 $\frac{1}{1+x^{2}}$ 量级。

@易错
1. 把两个 $\arctan$ 都换成 $\frac\pi2$，得到 $\ln1=0$，丢掉全部信息。
2. 估阶时误以为差是 $\frac1x$ 量级，得 $a=1$。
3. 忘记除以 $\arctan x\to\frac\pi2$，把 $b$ 算成 $1$。
4. 用洛必达时对 $x^{a}$ 与对数的乘积直接求导（应先化成商的形式）。

[23]
@题目
设曲面 $S$ 由方程 $F(ax-bz,\ ay-cz)=0$ 所确定，$F$ 有连续偏导数，$a,b,c$ 是不为零的常数，则曲面 $S$ 上任一点的切平面都平行于直线（　）.
A. $\dfrac{x}{a}=\dfrac{y}{b}=\dfrac{z}{c}$　　B. $\dfrac{x}{b}=\dfrac{y}{c}=\dfrac{z}{a}$　　C. $\dfrac{x}{c}=\dfrac{y}{b}=\dfrac{z}{a}$　　D. $\dfrac{x}{c}=\dfrac{y}{a}=\dfrac{z}{b}$

@切入点
"切平面平行于某直线"等价于"**法向量垂直于该直线的方向向量**"，即两者点积为零。所以只有两步：写出法向量、逐一检验四个方向。

写法向量：把曲面写成 $G(x,y,z)=F(u,v)=0$，其中 $u=ax-bz$，$v=ay-cz$，则
$$\mathbf n=\nabla G=(G_x,G_y,G_z)=(aF_1',\ aF_2',\ -bF_1'-cF_2') ,$$
（$F_1',F_2'$ 表示 $F$ 对第一、第二个中间变量的偏导）。

关键的观察是：法向量的三个分量中，前两个各"提供"一个 $a$，第三个是前两个的 $-\frac ba,-\frac ca$ 倍之和。所以要让点积为零，方向向量的前两个分量应当与 $b,c$ 有关、第三个与 $a$ 有关。试 $(b,c,a)$：
$$\mathbf n\cdot(b,c,a)=abF_1'+acF_2'+a(-bF_1'-cF_2')=0 ,$$
对任意的 $F$ 都成立。所以答案是方向为 $(b,c,a)$ 的直线，即 $\dfrac xb=\dfrac yc=\dfrac za$。

若一时看不出，就把四个选项的方向向量依次点乘验证，也很快。

@解答
把曲面写成 $G(x,y,z)=F(ax-bz,\ ay-cz)=0$，记 $u=ax-bz$，$v=ay-cz$，$F_1'=\dfrac{\partial F}{\partial u}$，$F_2'=\dfrac{\partial F}{\partial v}$。则
$$G_x=aF_1',  G_y=aF_2',  G_z=-bF_1'-cF_2' ,$$
故曲面在任一点的法向量为
$$\mathbf n=(aF_1',\ aF_2',\ -bF_1'-cF_2') .$$

取方向向量 $\mathbf s=(b,c,a)$，则
$$\mathbf n\cdot\mathbf s=abF_1'+acF_2'+a(-bF_1'-cF_2')=0 ,$$
即 $\mathbf n\perp\mathbf s$ 恒成立，故切平面恒平行于方向为 $(b,c,a)$ 的直线
$$\frac xb=\frac yc=\frac za .$$
选 **B**。

@考点
隐式曲面的法向量 $\nabla G$；多元复合函数求偏导；直线与平面平行的条件（方向向量与法向量垂直，点积为零）。

易混：直线 $\frac{x}{b}=\frac{y}{c}=\frac{z}{a}$ 的方向向量是 $(b,c,a)$（分母就是方向数），不要读成 $(\frac1b,\frac1c,\frac1a)$。

@易错
1. 求 $G_z$ 时漏掉一项（$u,v$ 都含 $z$，两条链都要算）。
2. 把方向向量与法向量的角色弄反（平行于直线要求点积为零，不是成比例）。
3. 选项的方向向量读错。

[24]
@题目
下列矩阵中，与矩阵
$$\begin{bmatrix} 1 & 1 & 0 \\ 0 & 1 & 1 \\ 0 & 0 & 1 \end{bmatrix}$$
相似的是（　　）.
$$\text{A. } \begin{bmatrix} 1 & 1 & -1 \\ 0 & 1 & 1 \\ 0 & 0 & 1 \end{bmatrix} \qquad \text{B. } \begin{bmatrix} 1 & 0 & -1 \\ 0 & 1 & 1 \\ 0 & 0 & 1 \end{bmatrix}$$
$$\text{C. } \begin{bmatrix} 1 & 1 & -1 \\ 0 & 1 & 0 \\ 0 & 0 & 1 \end{bmatrix} \qquad \text{D. } \begin{bmatrix} 1 & 0 & -1 \\ 0 & 1 & 0 \\ 0 & 0 & 1 \end{bmatrix}$$

@切入格
四个选项与题给矩阵的特征值完全相同（都是三重 $1$，因为都是对角元全为 $1$ 的上三角矩阵），所以**特征值帮不上忙**，必须用更细的相似不变量。

最常用的下一级不变量是秩：若 $M\sim J$，则对任意常数 $\lambda$ 都有
$$\mathrm r(M-\lambda E)=\mathrm r(J-\lambda E) .$$
取 $\lambda=1$（唯一的特征值）：
$$J-E=\begin{pmatrix}0&1&0\\0&0&1\\0&0&0\end{pmatrix},  \mathrm r(J-E)=2 .$$
于是只要算四个选项的 $\mathrm r(M-E)$，保留等于 $2$ 的那个：
- A：$\begin{pmatrix}0&1&-1\\0&0&1\\0&0&0\end{pmatrix}$，秩 $2$；
- B、C、D：都只有一个非零行（或两行成比例），秩为 $1$。

只有 A 通过，选 A。（进一步还可验证 $\mathrm r((M-E)^{2})=1$ 也与 $J$ 一致。）

这个方法的本质是：$\mathrm r(M-\lambda E)$ 决定了特征值 $\lambda$ 的**几何重数**，而几何重数是相似不变量。

@解答
记 $J=\begin{pmatrix}1&1&0\\0&1&1\\0&0&1\end{pmatrix}$。四个选项与 $J$ 都是对角元全为 $1$ 的上三角矩阵，特征值都是三重 $1$，故需用更细的不变量。

相似矩阵满足 $\mathrm r(M-E)=\mathrm r(J-E)$。计算
$$J-E=\begin{pmatrix}0&1&0\\0&0&1\\0&0&0\end{pmatrix},  \mathrm r(J-E)=2 .$$
再算各选项：
$$\text{A}:\begin{pmatrix}0&1&-1\\0&0&1\\0&0&0\end{pmatrix}\ \mathrm r=2; 
\text{B}:\begin{pmatrix}0&0&-1\\0&0&1\\0&0&0\end{pmatrix}\ \mathrm r=1;$$
$$\text{C}:\begin{pmatrix}0&1&-1\\0&0&0\\0&0&0\end{pmatrix}\ \mathrm r=1; 
\text{D}:\begin{pmatrix}0&0&-1\\0&0&0\\0&0&0\end{pmatrix}\ \mathrm r=1 .$$
只有 A 满足 $\mathrm r(M-E)=2$。故选 **A**。

@考点
相似的必要条件：相同的特征多项式、特征值、迹、行列式、秩，以及对每个 $\lambda$ 有 $\mathrm r(M-\lambda E)$ 相同（即几何重数相同）；若尔当块的秩。

易混：相同的特征值只是相似的必要条件，远不充分；本题四个选项特征值全同，差别只在几何重数。

@易错
1. 只比较特征值就随意选。
2. 计算 $M-E$ 时忘记减单位矩阵。
3. 秩算错（A 中两行线性无关）。
4. 误以为对角元相同的上三角矩阵都相似。

[25]
@题目
点 $P(1,-1,0)$ 到直线
$$L:\frac{x}{3}=\frac{y}{3}=\frac{z+1}{2}$$
的距离 $d=$________.

@切入点
点到直线的距离公式
$$d=\frac{|\overrightarrow{P_0P}\times\mathbf s|}{|\mathbf s|}$$
的几何含义是"以 $\overrightarrow{P_0P}$ 和 $\mathbf s$ 为邻边的平行四边形面积除以底 $|\mathbf s|$，得到高"。理解了这一点就不会把叉积记成点积。

所以只需三步：
1. 从直线的对称式方程读出一个点 $P_0$ 和方向向量 $\mathbf s$。本题 $\dfrac x3=\dfrac y3=\dfrac{z+1}{2}$ 给出 $P_0(0,0,-1)$、$\mathbf s=(3,3,2)$（分子中的常数取反号得到点的坐标，分母就是方向数）。
2. 算 $\overrightarrow{P_0P}=(1,-1,1)$ 与 $\mathbf s$ 的叉积。
3. 代公式。

@解答
直线 $L:\dfrac x3=\dfrac y3=\dfrac{z+1}{2}$ 过点 $P_0(0,0,-1)$，方向向量 $\mathbf s=(3,3,2)$。又
$$\overrightarrow{P_0P}=(1,-1,0)-(0,0,-1)=(1,-1,1) .$$
计算叉积：
$$\overrightarrow{P_0P}\times\mathbf s=\begin{vmatrix}\mathbf i&\mathbf j&\mathbf k\\1&-1&1\\3&3&2\end{vmatrix}=(-2-3,\ 3-2,\ 3+3)=(-5,\ 1,\ 6) ,$$
$$|\overrightarrow{P_0P}\times\mathbf s|=\sqrt{25+1+36}=\sqrt{62},  |\mathbf s|=\sqrt{9+9+4}=\sqrt{22} .$$
故
$$d=\frac{\sqrt{62}}{\sqrt{22}}=\sqrt{\frac{31}{11}}=\frac{\sqrt{341}}{11} .$$

@考点
空间点到直线的距离公式（叉积模除以方向向量的模）；由直线的对称式方程读取点与方向向量；向量积的计算。

易混：点到**平面**的距离用点积（$\frac{|\mathbf n\cdot\overrightarrow{P_0P}|}{|\mathbf n|}$），点到**直线**的距离用叉积；两者不要混。

@易错
1. 从 $\frac{z+1}{2}$ 读出点的 $z$ 坐标为 $1$（应为 $-1$）。
2. 叉积的第二个分量符号弄错（展开时第二项带负号）。
3. 分母写成 $|\mathbf s|^{2}$。
4. 最后不化简或化简出错（$\sqrt{62/22}=\sqrt{31/11}$）。

[26]
@题目
设曲线 $y = f(x) = x^n + n^2 x$（$n$ 为正整数），在其上点 $(1, 1 + n^2)$ 处的切线与 $x$ 轴交于点 $(a_n, 0)$. 求幂级数
$$\sum_{n=1}^{\infty} a_n x^{n+1}$$
的收敛域与和函数 $S(x)$.

@切入点
这道题分两段：先由几何条件求出 $a_n$，再做幂级数求和。

**第一段**：切线与 $x$ 轴交点。在 $(1,1+n^{2})$ 处 $f'(1)=n+n^{2}$，切线
$$y-(1+n^{2})=(n+n^{2})(x-1) ,$$
令 $y=0$ 得
$$a_n=1-\frac{1+n^{2}}{n(n+1)}=\frac{n(n+1)-(1+n^{2})}{n(n+1)}=\frac{n-1}{n(n+1)} .$$

**第二段**：求 $\sum a_nx^{n+1}$。关键是把 $a_n$ **拆成部分分式**：
$$\frac{n-1}{n(n+1)}=-\frac1n+\frac{2}{n+1} ,$$
这样两部分分别对应两个标准级数：
$$\sum_{n\geqslant1}\frac{x^{n}}{n}=-\ln(1-x),  \sum_{n\geqslant1}\frac{x^{n+1}}{n+1}=\sum_{m\geqslant2}\frac{x^{m}}{m}=-\ln(1-x)-x .$$
注意第二个和式**下标从 $2$ 开始**，所以要从 $-\ln(1-x)$ 中减去 $m=1$ 的项 $x$——这是本题最容易漏的一步。

收敛域：$R=1$；$x=1$ 时 $a_n\sim\frac1n$ 为正项，发散；$x=-1$ 时是交错级数且 $a_n$ 单调趋于 $0$，收敛。故收敛域 $[-1,1)$。

@解答
**求 $a_n$**。$f(x)=x^{n}+n^{2}x$，$f'(x)=nx^{n-1}+n^{2}$，故 $f'(1)=n+n^{2}$。点 $(1,1+n^{2})$ 处的切线为
$$y-(1+n^{2})=(n+n^{2})(x-1) .$$
令 $y=0$：
$$a_n=1-\frac{1+n^{2}}{n(n+1)}=\frac{n^{2}+n-1-n^{2}}{n(n+1)}=\frac{n-1}{n(n+1)} .$$

**收敛域**。由 $a_n\sim\dfrac1n$ 知 $\sum a_nx^{n+1}$ 的收敛半径 $R=1$。
$x=1$ 时通项 $a_n\sim\dfrac1n>0$，级数发散；
$x=-1$ 时通项为 $(-1)^{n+1}a_n$，而 $a_n\geqslant0$ 且当 $n\geqslant3$ 时单调递减趋于 $0$，由莱布尼茨判别法收敛。
故收敛域为 $[-1,1)$。

**和函数**。由部分分式
$$a_n=\frac{n-1}{n(n+1)}=-\frac1n+\frac{2}{n+1} ,$$
得（$-1\leqslant x<1$）
$$S(x)=\sum_{n=1}^{\infty}a_nx^{n+1}=-x\sum_{n=1}^{\infty}\frac{x^{n}}{n}+2\sum_{n=1}^{\infty}\frac{x^{n+1}}{n+1} .$$
其中
$$\sum_{n=1}^{\infty}\frac{x^{n}}{n}=-\ln(1-x),  \sum_{n=1}^{\infty}\frac{x^{n+1}}{n+1}=\sum_{m=2}^{\infty}\frac{x^{m}}{m}=-\ln(1-x)-x ,$$
故
$$S(x)=x\ln(1-x)+2[-\ln(1-x)-x]=(x-2)\ln(1-x)-2x,  -1\leqslant x<1 .$$

@考点
切线方程与截距；部分分式分解 $\frac{n-1}{n(n+1)}=-\frac1n+\frac{2}{n+1}$；标准展开 $\sum\frac{x^{n}}{n}=-\ln(1-x)$；求和时的下标平移；端点敛散性判别。

易混：$\sum\limits_{n\geqslant1}\frac{x^{n+1}}{n+1}$ 换元后是 $\sum\limits_{m\geqslant2}\frac{x^{m}}{m}$，比 $-\ln(1-x)$ 少了 $m=1$ 的项 $x$；漏掉这一步会使和函数差一个 $2x$。

@易错
1. 切线交点算错（注意 $a_n$ 是 $x$ 坐标）。
2. 部分分式系数弄错（应为 $-\frac1n+\frac{2}{n+1}$）。
3. 求和时下标不平移，直接写成 $-2\ln(1-x)$。
4. 收敛域写成 $(-1,1)$ 或 $[-1,1]$。

[27]
@题目
设 $A=\begin{pmatrix}1&2\\2&1\end{pmatrix}$，$B=\begin{pmatrix}1&4\\1&1\end{pmatrix}$，则下列选项中正确的是（　　）.
A. 必存在正交矩阵 $Q$，使得 $Q^{-1}AQ=B$
B. 必存在可逆矩阵 $P$，使得 $P^{-1}AP=B$
C. 必存在可逆矩阵 $P$，使得 $P^{\mathrm T}AP=B$
D. 必存在可逆矩阵 $P$，使得 $A=P^{\mathrm T}P$

@切入点
四个选项分别涉及**正交相似、相似、合同、正定分解**四种关系，逐个用各自的"特征"去筛，速度最快：

先算两个矩阵的特征值（这是判断相似的第一步）：
$$|\lambda E-A|=(\lambda-1)^{2}-4\Rightarrow\lambda=3,-1;  |\lambda E-B|=(\lambda-1)^{2}-4\Rightarrow\lambda=3,-1 .$$
两者特征值相同且**互异**，因而都可对角化到同一个 $\mathrm{diag}(3,-1)$，故 $A\sim B$——选项 B 成立。

再看其余三个为什么不成立，用的是同一个关键观察：**$A$ 是对称矩阵而 $B$ 不是**。
- A：$Q$ 正交时 $Q^{-1}AQ=Q^{\mathrm T}AQ$，它仍然对称，不可能等于非对称的 $B$；
- C：$P^{\mathrm T}AP$ 也永远对称，同理不可能；
- D：$A=P^{\mathrm T}P$ 蕴含 $A$ **半正定**（$X^{\mathrm T}AX=|PX|^{2}\geqslant0$），但 $A$ 有负特征值 $-1$，矛盾。

"对称性是合同与正交相似的不变量"这一条，是快速淘汰 A、C 的钥匙。

@解答
$$|\lambda E-A|=\begin{vmatrix}\lambda-1&-2\\-2&\lambda-1\end{vmatrix}=(\lambda-1)^{2}-4 ,$$
故 $A$ 的特征值为 $3,-1$；同理
$$|\lambda E-B|=\begin{vmatrix}\lambda-1&-4\\-1&\lambda-1\end{vmatrix}=(\lambda-1)^{2}-4 ,$$
$B$ 的特征值也是 $3,-1$。

两矩阵都是 $2$ 阶且各有两个互异特征值，故都可相似对角化到 $\mathrm{diag}(3,-1)$，从而 $A$ 与 $B$ 相似：存在可逆 $P$ 使 $P^{-1}AP=B$。**B 正确**。

A 错误：$Q$ 正交时 $Q^{-1}AQ=Q^{\mathrm T}AQ$，因 $A$ 对称故它仍对称，而 $B$ 不对称。

C 错误：$P^{\mathrm T}AP$ 恒对称（$(P^{\mathrm T}AP)^{\mathrm T}=P^{\mathrm T}A^{\mathrm T}P=P^{\mathrm T}AP$），与 $B$ 不对称矛盾。

D 错误：若 $A=P^{\mathrm T}P$，则对任意 $X$ 有 $X^{\mathrm T}AX=|PX|^{2}\geqslant0$，即 $A$ 半正定；但 $A$ 有特征值 $-1<0$，矛盾。

故选 **B**。

@考点
相似的判定（有 $n$ 个互异特征值 $\Rightarrow$ 可对角化；特征值相同且都可对角化 $\Rightarrow$ 相似）；合同变换与正交相似保持对称性；$A=P^{\mathrm T}P$ 蕴含半正定。

易混：相似要求 $P^{-1}AP$，合同要求 $P^{\mathrm T}AP$；只有 $P$ 正交时两者一致。相似保持特征值，合同保持惯性指数，两者都保持秩。

@易错
1. 只看到"特征值相同"就以为四个选项都对。
2. 忽略对称性这个硬约束，在 A、C 上纠缠。
3. 认为 $A=P^{\mathrm T}P$ 对任意 $A$ 都成立。
4. 特征值算错（注意 $B$ 的两个非对角元乘积是 $4$）。

[28]
@题目
设上凸曲线 $y = y(x)\ (y > 0)$ 上任一点 $M(x, y)$ 处的切线与 $x$ 轴交于点 $N$，且满足 $|OM| = |ON|,\ y(0) = 1,\ y'(x) > 0$，求 $y = y(x)$.

@切入点
几何条件题的第一步永远是"把几何语言翻译成方程"。

切线在 $M(x,y)$ 处：$Y-y=y'(X-x)$，令 $Y=0$ 得
$$N(x-\frac{y}{y'},\ 0) .$$
条件 $|OM|=|ON|$ 即
$$\sqrt{x^{2}+y^{2}}=|x-\frac{y}{y'}| .$$

去绝对值时要用题给的符号条件：$y>0$、$y'>0$ 使 $\dfrac{y}{y'}>0$，故 $x-\dfrac{y}{y'}<x\leqslant\sqrt{x^{2}+y^{2}}$，于是括号内只能取**负号**：
$$x-\frac{y}{y'}=-\sqrt{x^{2}+y^{2}} .$$
（这一步不讨论符号就会漏解或得到错误分支。）

整理得 $\dfrac{y}{y'}=x+\sqrt{x^{2}+y^{2}}$，即
$$\frac{dx}{dy}=\frac{x+\sqrt{x^{2}+y^{2}}}{y} .$$
注意这里**把 $x$ 看成 $y$ 的函数**更合适，因为这样右端是关于 $\frac xy$ 的齐次函数，可以用 $x=uy$ 代换。若坚持写成 $\frac{dy}{dx}$，方程形式会难看得多。这种"倒过来看自变量"的灵活性是解微分方程的常用技巧。

最后用 $y(0)=1$ 定常数，并化简、验证 $y'>0$ 与上凸。

@解答
曲线在 $M(x,y)$ 处的切线为 $Y-y=y'(X-x)$，令 $Y=0$ 得
$$N(x-\frac{y}{y'},\ 0) .$$
由 $|OM|=|ON|$：
$$\sqrt{x^{2}+y^{2}}=|x-\frac{y}{y'}| .$$
因 $y>0$，$y'>0$，有 $x-\dfrac{y}{y'}<x\leqslant\sqrt{x^{2}+y^{2}}$，故只能
$$x-\frac{y}{y'}=-\sqrt{x^{2}+y^{2}}\Longrightarrow \frac{dx}{dy}=\frac{x+\sqrt{x^{2}+y^{2}}}{y} .$$

这是关于 $x=x(y)$ 的齐次方程。令 $x=uy$（$y>0$），则 $\dfrac{dx}{dy}=u+y\dfrac{du}{dy}$，代入得
$$u+y\frac{du}{dy}=u+\sqrt{1+u^{2}}\Longrightarrow \frac{du}{\sqrt{1+u^{2}}}=\frac{dy}{y} ,$$
积分
$$\ln(u+\sqrt{1+u^{2}})=\ln y+\ln C\Longrightarrow u+\sqrt{1+u^{2}}=Cy ,$$
即
$$\frac xy+\frac{\sqrt{x^{2}+y^{2}}}{y}=Cy\Longrightarrow x+\sqrt{x^{2}+y^{2}}=Cy^{2} .$$
由 $y(0)=1$ 得 $0+1=C$，即 $C=1$：
$$\sqrt{x^{2}+y^{2}}=y^{2}-x\Longrightarrow x^{2}+y^{2}=y^{4}-2xy^{2}+x^{2}\Longrightarrow y^{2}=y^{4}-2xy^{2} ,$$
约去 $y^{2}>0$ 得 $y^{2}=2x+1$，即
$$y=\sqrt{2x+1} .$$
检验：$y'=\dfrac{1}{\sqrt{2x+1}}>0$，$y''=-\dfrac{1}{(2x+1)^{3/2}}<0$（上凸），$y(0)=1$，全部条件满足。

@考点
切线与坐标轴交点的求法；几何条件化为微分方程；齐次方程的代换 $x=uy$（把 $x$ 视为 $y$ 的函数）；$\int\frac{du}{\sqrt{1+u^{2}}}=\ln(u+\sqrt{1+u^{2}})$；由定解条件定常数并验证。

易混：去绝对值必须借助题给的符号条件（$y>0$、$y'>0$、上凸），否则会得到另一支不合题意的解。

@易错
1. 不讨论绝对值的符号，取成 $x-\frac{y}{y'}=+\sqrt{x^{2}+y^{2}}$。
2. 坚持写 $\frac{dy}{dx}$，得到不便求解的方程。
3. 最后不化简（$x+\sqrt{x^{2}+y^{2}}=y^{2}$ 是隐式解，应化成显式）。
4. 不验证 $y'>0$ 与上凸。

[29]
@题目
设曲面 $S:|x|+|y|+|z|=1$，则
$$I=\oiint_S (x+y+|z|)\,dS=\underline{\qquad}$$

@切入点
$S:|x|+|y|+|z|=1$ 是**正八面体的表面**，直接分成八个三角形面片积分是可行但笨重的。聪明的做法是把三项分别用对称性处理：

- $\displaystyle\oiint_Sx dS$：$S$ 关于 $x\to-x$ 对称（方程含 $|x|$），而 $x$ 是奇函数，故积分为 $0$；$y$ 同理。这一步砍掉两项。
- $\displaystyle\oiint_S|z| dS$：这里用**轮换对称性**——$S$ 在 $x,y,z$ 的任意置换下不变，故
$$\oiint_S|x|dS=\oiint_S|y|dS=\oiint_S|z|dS=\frac13\oiint_S(|x|+|y|+|z|)dS .$$
而在 $S$ 上 $|x|+|y|+|z|\equiv1$（这正是曲面方程！），于是最后一个积分就是**曲面的面积**。

这是本题最漂亮的一步：把被积函数用曲面方程换成常数 $1$。

最后算面积：八个全等的正三角形，每个的顶点如 $(1,0,0),(0,1,0),(0,0,1)$，边长 $\sqrt2$，面积 $\dfrac{\sqrt3}{4}(\sqrt2)^{2}=\dfrac{\sqrt3}{2}$，总面积 $8\cdot\dfrac{\sqrt3}{2}=4\sqrt3$。

@解答
$S$ 关于坐标平面对称（方程只含 $|x|,|y|,|z|$），而 $x$、$y$ 关于相应变量为奇函数，故
$$\oiint_Sx dS=\oiint_Sy dS=0 .$$

由 $S$ 关于 $x,y,z$ 的轮换对称性，
$$\oiint_S|x|dS=\oiint_S|y|dS=\oiint_S|z|dS=\frac13\oiint_S(|x|+|y|+|z|)dS=\frac13\oiint_SdS ,$$
其中用到在 $S$ 上 $|x|+|y|+|z|=1$。

$S$ 是正八面体表面，由 $8$ 个全等正三角形组成，每个三角形的顶点为 $(\pm1,0,0),(0,\pm1,0),(0,0,\pm1)$ 中相应的三个，边长为 $\sqrt2$，面积
$$\frac{\sqrt3}{4}(\sqrt2)^{2}=\frac{\sqrt3}{2} ,$$
故 $\displaystyle\oiint_SdS=8\cdot\frac{\sqrt3}{2}=4\sqrt3$。因此
$$I=0+0+\frac13\cdot4\sqrt3=\frac{4\sqrt3}{3} .$$

@考点
第一类曲面积分的对称性化简（奇偶对称与轮换对称）；利用曲面方程化简被积函数；正八面体的表面积；正三角形面积公式 $\frac{\sqrt3}{4}a^{2}$。

易混：轮换对称性要求曲面在变量置换下不变；本题方程 $|x|+|y|+|z|=1$ 显然满足。而奇偶对称性用于 $x,y$ 这样的一次项。

@易错
1. 不用对称性，分八片硬算。
2. 忘记在 $S$ 上 $|x|+|y|+|z|=1$，多算一层积分。
3. 正三角形边长取成 $1$（应为 $\sqrt2$）。
4. 面数记成 $4$ 或 $6$。

[30]
@题目
设 $A$ 是 $m \times n$ 矩阵，则非齐次线性方程组 $AX = b$ 有解的充分必要条件是（　　）.
A. $\mathrm{r}(A) = \mathrm{r}(A^{\mathrm{T}}) = m$　B. $\mathrm{r}(A) = \mathrm{r}(A^{\mathrm{T}}) = n$
$$\text{C. } \mathrm{r}(A^{\mathrm{T}}) = \mathrm{r}\begin{bmatrix} A^{\mathrm{T}} \\ b^{\mathrm{T}} \end{bmatrix} = m \qquad \text{D. } A^{\mathrm{T}}X = 0 \text{ 与 } \begin{bmatrix} A^{\mathrm{T}} \\ b^{\mathrm{T}} \end{bmatrix} X = 0 \text{ 同解}$$

@切入点
$AX=b$ 有解的标准判据是 $\mathrm r(A)=\mathrm r(A,b)$，但四个选项都不是这个形式，所以要把它**翻译**成别的语言。

最有力的翻译是**列空间**语言：
$$AX=b\ \text{有解}\Longleftrightarrow b\ \text{可由}\ A\ \text{的列向量组线性表出}\Longleftrightarrow b\in\mathrm{Col}(A) .$$

再看选项 D 说的是什么：
- $A^{\mathrm T}X=0$ 的解 $X$ 满足"$X$ 与 $A$ 的每一列都正交"；
- $\begin{pmatrix}A^{\mathrm T}\\ b^{\mathrm T}\end{pmatrix}X=0$ 的解还要额外满足"$X$ 与 $b$ 正交"。

第二个方程组的解集总是含于第一个之中；两者**同解**就等于说："凡是与 $A$ 的所有列都正交的向量，必定也与 $b$ 正交"，即
$$\mathrm{Col}(A)^{\perp}\subseteq\{b\}^{\perp}\Longleftrightarrow b\in\mathrm{Col}(A) ,$$
这正是有解的充要条件。所以选 D。

再看为什么 A、B、C 不对：它们都附加了"秩等于 $m$ 或 $n$"这种**额外要求**，只是充分或无关条件。特别是 C，其前半 $\mathrm r(A^{\mathrm T})=\mathrm r\begin{pmatrix}A^{\mathrm T}\\ b^{\mathrm T}\end{pmatrix}$ 确实等价于有解（它就是 $\mathrm r(A)=\mathrm r(A,b)$ 的转置写法），但后面多要求了 $=m$，就变成只充分不必要。

@解答
$AX=b$ 有解 $\Longleftrightarrow$ $b$ 可由 $A$ 的列向量组线性表出 $\Longleftrightarrow$ $b\in\mathrm{Col}(A)$。

注意：$A^{\mathrm T}X=0$ 表示 $X$ 与 $A$ 的每一列都正交，即 $X\in\mathrm{Col}(A)^{\perp}$；而
$$\begin{pmatrix}A^{\mathrm T}\\ b^{\mathrm T}\end{pmatrix}X=0$$
表示 $X$ 与 $A$ 的每一列以及 $b$ 都正交，即 $X\in\mathrm{Col}(A)^{\perp}\cap\{b\}^{\perp}$。

后者的解集恒含于前者。两者同解
$$\Longleftrightarrow \mathrm{Col}(A)^{\perp}\subseteq\{b\}^{\perp}\Longleftrightarrow b\in(\mathrm{Col}(A)^{\perp})^{\perp}=\mathrm{Col}(A)\Longleftrightarrow AX=b\ \text{有解} .$$
故选 **D**。

（A、B 中的秩条件只是充分或无关条件；C 中 $\mathrm r(A^{\mathrm T})=\mathrm r\begin{pmatrix}A^{\mathrm T}\\ b^{\mathrm T}\end{pmatrix}$ 确实等价于有解，但额外要求它等于 $m$，故只充分不必要。）

@考点
线性方程组有解的判定；列空间与正交补；$(W^{\perp})^{\perp}=W$；转置后行秩与列秩的关系 $\mathrm r(A^{\mathrm T})=\mathrm r(A)$。

易混：$\mathrm r(A)=\mathrm r(A,b)$ 与 $\mathrm r(A^{\mathrm T})=\mathrm r\begin{pmatrix}A^{\mathrm T}\\ b^{\mathrm T}\end{pmatrix}$ 是同一条件的两种写法（把增广矩阵按行拼与按列拼互为转置）。

@易错
1. 选 C（多了一个"$=m$"的限制）。
2. 把 $A^{\mathrm T}X=0$ 理解成 $AX=0$。
3. 忘记"后者解集含于前者"这个自动成立的方向，把同解条件想复杂。
4. 认为 $\mathrm r(A)=m$（行满秩）是必要条件。

[31]
@题目
设 $A, B$ 为 $n$ 阶矩阵，$P, Q$ 为 $n$ 阶可逆矩阵，则下列选项中错误的是（　　）.
A. 若 $A = BQ$，则 $B$ 的列向量组与 $A$ 的列向量组等价
B. 若 $A = PB$，则 $B$ 的行向量组与 $A$ 的行向量组等价
C. 若 $A = PBQ$，则矩阵 $A$ 与 $B$ 等价
D. 若 $A = PBQ$，则 $B$ 的行（列）向量组与 $A$ 的行（列）向量组等价

@切入点
这道题考的是"**左乘管行、右乘管列**"这条规律的精确含义：

- $A=PB$（左乘可逆矩阵）：$A$ 的每一行是 $B$ 各行的线性组合，且由 $B=P^{-1}A$ 反向也成立 $\Rightarrow$ **行向量组等价**；但列向量组一般会变。
- $A=BQ$（右乘可逆矩阵）：$A$ 的每一列是 $B$ 各列的线性组合，反向亦然 $\Rightarrow$ **列向量组等价**；但行向量组一般会变。

于是 A、B 两个选项分别对应上面两条，正确；C 是矩阵等价的定义，正确。

D 把两者混在一起说"$A=PBQ$ 时行、列向量组都等价"——这是错的：左乘 $P$ 保住了行等价但破坏了列，右乘 $Q$ 保住了列却破坏了行，两个一起做**两边都保不住**。

举反例最简单的办法是让 $P$ 做一次行交换、$Q$ 取单位矩阵：
$$B=\begin{pmatrix}1&0\\0&0\end{pmatrix},  P=\begin{pmatrix}0&1\\1&0\end{pmatrix},  Q=E\Longrightarrow A=\begin{pmatrix}0&0\\1&0\end{pmatrix} .$$
$B$ 的列向量组由 $(1,0)^{\mathrm T}$ 张成，$A$ 的列向量组由 $(0,1)^{\mathrm T}$ 张成，二者不等价。

@解答
A 正确：由 $A=BQ$（$Q$ 可逆）知 $A$ 的列向量是 $B$ 的列向量的线性组合；又 $B=AQ^{-1}$，$B$ 的列向量也是 $A$ 的列向量的线性组合，故两列向量组等价。

B 正确：由 $A=PB$（$P$ 可逆）知 $A$ 的行向量是 $B$ 的行向量的线性组合；又 $B=P^{-1}A$，反向亦然，故两行向量组等价。

C 正确：$A=PBQ$（$P,Q$ 可逆）正是矩阵 $A$ 与 $B$ 等价的定义。

D **错误**。反例：取
$$B=\begin{pmatrix}1&0\\0&0\end{pmatrix},  P=\begin{pmatrix}0&1\\1&0\end{pmatrix},  Q=E ,$$
则 $A=PBQ=\begin{pmatrix}0&0\\1&0\end{pmatrix}$。$B$ 的列向量组的极大无关组为 $(1,0)^{\mathrm T}$，$A$ 的为 $(0,1)^{\mathrm T}$，二者不能互相线性表出，故列向量组不等价。

选 **D**。

@考点
初等变换与向量组等价的关系（左乘可逆矩阵保持行向量组等价、右乘可逆矩阵保持列向量组等价）；矩阵等价的定义；向量组等价的定义（互相线性表出）。

易混：矩阵"等价"（$A=PBQ$，只要求秩相同）与向量组"等价"（互相线性表出，要求张成同一个子空间）是两个不同概念，本题正是考这个区别。

@易错
1. 认为 $A=PBQ$ 既保行又保列。
2. 把"矩阵等价"与"向量组等价"混为一谈。
3. 反例构造得不够简单，验算出错。

[32]
@题目
设随机变量 $X$ 的概率密度为
$$f(x)=\begin{cases}\dfrac{1}{\sqrt{2\pi}}\mathrm e^{-\frac{x^2}{2}},&x\leqslant0,\\ \mathrm e^{-2x},&x>0,\end{cases}$$
求 $Y=X^2$ 的分布函数和概率密度（可用 $\varphi(x)$ 和 $\Phi(x)$ 表示）.

@切入点
$Y=X^{2}$ 不是单调变换（$X$ 可正可负），所以**必须用分布函数法**：
$$F_Y(y)=P\{X^{2}\leqslant y\}=P\{-\sqrt y\leqslant X\leqslant\sqrt y\} (y>0) .$$

难点在于 $X$ 的密度是**分段**的：$x\leqslant0$ 时是标准正态密度 $\varphi(x)$，$x>0$ 时是指数型 $\mathrm e^{-2x}$。所以上式的积分要在 $x=0$ 处断开，两段分别用各自的公式：
$$F_Y(y)=\int_{-\sqrt y}^{0}\varphi(x)dx+\int_{0}^{\sqrt y}\mathrm e^{-2x}dx .$$
第一段用标准正态分布函数：$\displaystyle\int_{-\sqrt y}^{0}\varphi=\Phi(0)-\Phi(-\sqrt y)=\Phi(\sqrt y)-\frac12$（用了 $\Phi(-t)=1-\Phi(t)$）。第二段直接积出。两段的 $\frac12$ 恰好抵消，结果异常干净：
$$F_Y(y)=\Phi(\sqrt y)-\frac{\mathrm e^{-2\sqrt y}}{2} .$$
（可以用 $y\to0^{+}$ 时应趋于 $0$ 来检验：$\Phi(0)-\frac12=0$ ✓。）

求密度时对 $\sqrt y$ 求导，每项都要乘 $\dfrac{1}{2\sqrt y}$。

@解答
$X$ 的密度分段给出，先注意归一性成立：$\displaystyle\int_{-\infty}^{0}\varphi=\frac12$，$\displaystyle\int_{0}^{+\infty}\mathrm e^{-2x}dx=\frac12$。

当 $y\leqslant0$ 时 $F_Y(y)=0$。当 $y>0$ 时
$$F_Y(y)=P\{-\sqrt y\leqslant X\leqslant\sqrt y\}=\int_{-\sqrt y}^{0}\frac{1}{\sqrt{2\pi}}\mathrm e^{-\frac{x^{2}}{2}}dx+\int_{0}^{\sqrt y}\mathrm e^{-2x}dx .$$
其中
$$\int_{-\sqrt y}^{0}\varphi(x)dx=\Phi(0)-\Phi(-\sqrt y)=\frac12-[1-\Phi(\sqrt y)]=\Phi(\sqrt y)-\frac12 ,$$
$$\int_{0}^{\sqrt y}\mathrm e^{-2x}dx=\frac{1-\mathrm e^{-2\sqrt y}}{2} .$$
故
$$F_Y(y)=\begin{cases}\Phi(\sqrt y)-\dfrac{\mathrm e^{-2\sqrt y}}{2},&y>0,\\[4pt] 0,&y\leqslant0 .\end{cases}$$

求导（$y>0$）：
$$f_Y(y)=\varphi(\sqrt y)\cdot\frac{1}{2\sqrt y}+\frac{2\mathrm e^{-2\sqrt y}}{2}\cdot\frac{1}{2\sqrt y}=\frac{\varphi(\sqrt y)+\mathrm e^{-2\sqrt y}}{2\sqrt y} ,$$
即
$$f_Y(y)=\begin{cases}\dfrac{\varphi(\sqrt y)+\mathrm e^{-2\sqrt y}}{2\sqrt y},&y>0,\\[6pt] 0,&y\leqslant0 .\end{cases}$$

@考点
非单调变换 $Y=X^{2}$ 的分布函数法；分段密度的积分要在分界点断开；标准正态分布函数的性质 $\Phi(-t)=1-\Phi(t)$、$\Phi(0)=\frac12$；复合求导 $\frac{d}{dy}g(\sqrt y)=g'(\sqrt y)\frac{1}{2\sqrt y}$。

易混：$Y=X^{2}$ 时 $F_Y(y)=F_X(\sqrt y)-F_X(-\sqrt y)$，密度公式是 $\frac{f_X(\sqrt y)+f_X(-\sqrt y)}{2\sqrt y}$——本题正是这个公式，只是 $f_X$ 在两侧表达式不同。

@易错
1. 当成单调变换，只写 $F_X(\sqrt y)$。
2. 积分时不在 $x=0$ 处断开，整段用同一个密度。
3. 求导时漏掉 $\frac{1}{2\sqrt y}$。
4. $\Phi(-\sqrt y)$ 的化简出错。

[33]
@题目
设 $f(x,y)=\sqrt{|xy|}$，则（　）.
A. 当 $x>0$ 时，$f'_x(x,y)=-\dfrac{1}{2}\sqrt{|\dfrac{y}{x}|}$　　B. 当 $x<0$ 时，$f'_x(x,y)=\dfrac{1}{2}\sqrt{|\dfrac{y}{x}|}$
C. 当 $y\neq 0$ 时，$f'_x(0,y)=0$　　D. 当 $y\neq 0$ 时，$f'_x(0,y)$ 不存在

@切入点
$f=\sqrt{|xy|}$ 含双重绝对值和根号，所以要**分区域**讨论，并且在 $x=0$ 处必须回到**定义**。

先看 $x\neq0$ 的情形。可以把 $f$ 写成 $\sqrt{|x|}\sqrt{|y|}$，于是对 $x$ 求导只需对 $\sqrt{|x|}$ 求导：
$$\frac{d}{dx}\sqrt{|x|}=\begin{cases}\dfrac{1}{2\sqrt x},&x>0,\\[4pt] -\dfrac{1}{2\sqrt{-x}},&x<0 .\end{cases}$$
于是
$$f'_x=\begin{cases}\dfrac12\sqrt{|\dfrac yx|},&x>0,\\[4pt] -\dfrac12\sqrt{|\dfrac yx|},&x<0 .\end{cases}$$
**$x>0$ 时是正号、$x<0$ 时是负号**——A、B 恰好把符号各写反了一次，所以都错。（直观上：沿 $x$ 增大方向，$|x|$ 在右半轴变大、在左半轴变小，故 $f$ 先减后增。）

再看 $x=0$、$y\neq0$：用定义
$$f'_x(0,y)=\lim_{x\to0}\frac{\sqrt{|xy|}-0}{x}=\lim_{x\to0}\frac{\sqrt{|y|}\sqrt{|x|}}{x} .$$
分子是 $|x|^{1/2}$ 量级、分母是 $x$，商的绝对值 $\sim|x|^{-1/2}\to+\infty$，**极限不存在**（而且左右侧还差符号）。故 C 错、D 对。

注意 $f'_x(0,0)$ 是存在的（此时 $f(x,0)\equiv0$），但题目问的是 $y\neq0$，正是排除了这个特殊点。

@解答
当 $x\neq0$ 时 $f(x,y)=\sqrt{|x|}\sqrt{|y|}$，故
$$x>0:  f'_x=\sqrt{|y|}\cdot\frac{1}{2\sqrt x}=\frac12\sqrt{|\frac yx|}; 
x<0:  f'_x=\sqrt{|y|}\cdot(-\frac{1}{2\sqrt{-x}})=-\frac12\sqrt{|\frac yx|} .$$
故 A（$x>0$ 时应为正号）与 B（$x<0$ 时应为负号）都错误。

当 $x=0$、$y\neq0$ 时，由定义
$$f'_x(0,y)=\lim_{x\to0}\frac{f(x,y)-f(0,y)}{x}=\lim_{x\to0}\frac{\sqrt{|y|}\sqrt{|x|}}{x} .$$
当 $x\to0^{+}$ 时它等于 $\dfrac{\sqrt{|y|}}{\sqrt x}\to+\infty$；当 $x\to0^{-}$ 时等于 $-\dfrac{\sqrt{|y|}}{\sqrt{-x}}\to-\infty$。极限不存在，即 $f'_x(0,y)$ **不存在**。

故 C 错误，**D 正确**。

@考点
含绝对值函数的分区间求导；偏导数在分界点必须用定义计算；$\sqrt{|x|}$ 在 $0$ 处不可导（尖点，导数为无穷）。

易混：$f'_x(0,0)=0$ 是存在的（因为 $f(x,0)\equiv0$），但 $y\neq0$ 时 $f'_x(0,y)$ 不存在；同一个函数在原点与在坐标轴上其他点的表现完全不同。

@易错
1. 形式地对 $\sqrt{|xy|}$ 求导而不分 $x$ 的符号。
2. 在 $x=0$ 处套用 $x\neq0$ 时的公式。
3. 认为极限为 $+\infty$ 就"存在"（导数要求有限极限）。
4. 把 $f'_x(0,y)$ 与 $f'_x(0,0)$ 混为一谈。

[34]
@题目
设 $X_1,X_2,\cdots,X_n$ 为来自总体 $X \sim N(\mu,\sigma^2)$ 的简单随机样本，$\sigma^2$ 未知，$\overline{X}$ 为样本均值，$S^2$ 为样本方差，检验水平为 $\alpha$，则 $H_0: \mu \geqslant \mu_0$，$H_1: \mu < \mu_0$ 的拒绝域为 $\underline{\qquad\qquad}$。

@切入点
写假设检验的拒绝域，只需按顺序回答三个问题：

1. **用哪个统计量？** 单个正态总体、检验均值、$\sigma^{2}$ **未知** $\Rightarrow$ 用 $t$ 统计量
$$t=\frac{\overline X-\mu_0}{S/\sqrt n}\sim t(n-1) (\text{当}\ \mu=\mu_0\ \text{时}) .$$
（若 $\sigma^{2}$ 已知则用 $U$ 统计量，这是最常见的混淆点。）
2. **单侧还是双侧？** 看备择假设 $H_1$：这里 $H_1:\mu<\mu_0$，是**左侧**检验。
3. **临界值取多少？** 左侧检验把全部 $\alpha$ 放在左尾，临界值是 $-t_{\alpha}(n-1)$。

于是拒绝域
$$\{\frac{\overline X-\mu_0}{S/\sqrt n}<-t_{\alpha}(n-1)\} .$$
自由度是 $n-1$（因为用样本方差 $S^{2}$ 估计了 $\sigma^{2}$，损失一个自由度）。

@解答
因总体 $X\sim N(\mu,\sigma^{2})$ 且 $\sigma^{2}$ 未知，检验均值应使用 $t$ 统计量：当 $\mu=\mu_0$ 时
$$t=\frac{\overline X-\mu_0}{S/\sqrt n}\sim t(n-1) .$$
由 $H_1:\mu<\mu_0$ 知这是左侧检验，显著性水平为 $\alpha$，故拒绝域为
$$\{\frac{\overline X-\mu_0}{S/\sqrt n}<-t_{\alpha}(n-1)\} .$$

@考点
单个正态总体均值的假设检验：$\sigma^{2}$ 已知用 $U$ 检验、未知用 $t$ 检验；单侧检验的方向由 $H_1$ 决定；$t$ 分布的自由度为 $n-1$。

易混：双侧检验（$H_1:\mu\neq\mu_0$）的拒绝域是 $|t|>t_{\alpha/2}(n-1)$，临界值下标是 $\frac\alpha2$；单侧用 $t_\alpha$。把下标写错是最常见的失分点。

@易错
1. 用 $U$ 检验（把 $\sigma$ 当已知）。
2. 自由度写成 $n$。
3. 临界值写成 $-t_{\alpha/2}(n-1)$。
4. 不等号方向写反（左侧检验应为 $<$ 负临界值）。

[35]
@题目
设 $y=f(x)$ 由参数方程
$$\begin{cases}x=t^{2}+1\\[0pt] y=4t-t^{2}\end{cases}\qquad (t\geqslant 0)$$
确定，则 $\displaystyle\lim_{n\to\infty}n\Big[f\Big(\frac{2n+1}{n}\Big)-3\Big]=$ ______.

@切入点
先识破极限的**本质**：
$$\frac{2n+1}{n}=2+\frac1n\to2 ,$$
而且当 $x=2$ 时（由 $x=t^{2}+1$ 得 $t=1$，$t\geqslant0$）有 $y=4-1=3$，也就是 $f(2)=3$。于是
$$n[f(2+\frac1n)-3]=\frac{f(2+\frac1n)-f(2)}{\frac1n} ,$$
这正是**导数定义**中的差商（沿 $h=\frac1n\to0$ 的数列）。所以极限就是 $f'(2)$。

看穿这一点后，剩下的只是参数方程求导：
$$\frac{dy}{dx}=\frac{dy/dt}{dx/dt}=\frac{4-2t}{2t} ,$$
在 $t=1$ 处取值 $\dfrac{2}{2}=1$。

注意两个细节：一是必须先由 $x=2$ **反解出参数 $t=1$**（并用 $t\geqslant0$ 排除 $t=-1$）；二是数列极限能等于函数导数，依据是归结原则（函数极限存在时任何趋于该点的数列都给出同一极限）。

@解答
由 $\dfrac{2n+1}{n}=2+\dfrac1n$ 知所求为
$$\lim_{n\to\infty}\frac{f(2+\frac1n)-3}{\frac1n} .$$

先求 $f(2)$：由 $x=t^{2}+1=2$ 及 $t\geqslant0$ 得 $t=1$，此时
$$y=4\cdot1-1^{2}=3 ,$$
即 $f(2)=3$。故上式即
$$\lim_{n\to\infty}\frac{f(2+\frac1n)-f(2)}{\frac1n}=f'(2) $$
（由归结原则，函数在 $x=2$ 可导时该数列极限等于导数）。

由参数方程求导
$$\frac{dy}{dx}=\frac{y'(t)}{x'(t)}=\frac{4-2t}{2t} ,$$
在 $t=1$（对应 $x=2$）处
$$f'(2)=\frac{4-2}{2}=1 .$$
故所求极限为 $1$。

@考点
导数定义的识别（差商形式的数列极限）；参数方程确定的函数求导 $\frac{dy}{dx}=\frac{dy/dt}{dx/dt}$；由 $x$ 的值反解参数 $t$；归结原则。

易混：$\frac{dy}{dx}$ 是 $\frac{dy/dt}{dx/dt}$ 而不是 $\frac{dy}{dt}\cdot\frac{dx}{dt}$；另外要在**参数值**处代入，不能直接把 $x=2$ 代进 $\frac{4-2t}{2t}$。

@易错
1. 没看出这是导数定义，试图把 $f$ 的显式表达式解出来。
2. 反解 $t$ 时取 $t=-1$（与 $t\geqslant0$ 矛盾）。
3. 参数方程求导写成 $\frac{dy/dt}{dx/dt}$ 的倒数。
4. 忘记验证 $f(2)=3$ 与题中的 $3$ 一致（若不一致就不是导数定义）。

[36]
@题目
设
$$A = \begin{bmatrix} 1 & 0 & -1 \\ 2 & a & 1 \\ 1 & 2 & 1 \end{bmatrix}$$
$B$ 是 3 阶矩阵，且 $\mathrm{r}(B) = 2$，$\mathrm{r}(AB) = 1$，$A^{*}$ 与 $B^{*}$ 分别是 $A$ 与 $B$ 的伴随矩阵，则下列选项中正确的是（　　）.
$$\text{A. } \mathrm{r}\begin{bmatrix} A^{*} & O \\ A & B \end{bmatrix} = 3 \qquad \text{B. } \mathrm{r}\begin{bmatrix} A & O \\ O & B^{*} \end{bmatrix} = 3$$
$$\text{C. } \mathrm{r}\begin{bmatrix} A^{*} & B \\ O & A \end{bmatrix} = 3 \qquad \text{D. } \mathrm{r}\begin{bmatrix} A & B^{*} \\ O & B \end{bmatrix} = 3$$

@切入点
四个选项都是分块矩阵的秩，而分块矩阵的秩只有在**分块对角**（或分块三角且对角块"够好"）时才有简单结论：
$$\mathrm r\begin{pmatrix}A&O\\O&B\end{pmatrix}=\mathrm r(A)+\mathrm r(B) .$$
选项 B 恰是这种形状，最容易算；A、C、D 都是分块三角或更复杂的形状，秩一般**不**等于对角块秩之和。所以策略是：先把 $\mathrm r(A)$、$\mathrm r(A^{*})$、$\mathrm r(B^{*})$ 都算出来，再直接验证 B。

求 $\mathrm r(A)$ 的突破口是条件 $\mathrm r(AB)=1<\mathrm r(B)=2$：若 $A$ 可逆，则 $\mathrm r(AB)=\mathrm r(B)=2$，矛盾。故 $A$ 不可逆，$|A|=0$，解出 $a$。算得 $|A|=2a-6$，故 $a=3$，此时观察行的关系可知 $\mathrm r(A)=2$。

再用伴随矩阵的秩公式（$n=3$）：
$$\mathrm r(A)=2=n-1\Rightarrow\mathrm r(A^{*})=1;  \mathrm r(B)=2=n-1\Rightarrow\mathrm r(B^{*})=1 .$$
于是选项 B 的秩为 $2+1=3$。

@解答
若 $A$ 可逆，则 $\mathrm r(AB)=\mathrm r(B)=2$，与 $\mathrm r(AB)=1$ 矛盾，故 $A$ 不可逆，$|A|=0$。计算
$$|A|=\begin{vmatrix}1&0&-1\\2&a&1\\1&2&1\end{vmatrix}=1\cdot(a-2)+(-1)\cdot(4-a)=2a-6 ,$$
故 $a=3$。此时
$$A=\begin{pmatrix}1&0&-1\\2&3&1\\1&2&1\end{pmatrix}\xrightarrow{r_2-2r_1,\ r_3-r_1}\begin{pmatrix}1&0&-1\\0&3&3\\0&2&2\end{pmatrix},$$
后两行成比例，故 $\mathrm r(A)=2$。

由伴随矩阵的秩公式（$n=3$）：$\mathrm r(A)=2=n-1\Rightarrow\mathrm r(A^{*})=1$；$\mathrm r(B)=2=n-1\Rightarrow\mathrm r(B^{*})=1$。

于是
$$\mathrm r\begin{pmatrix}A&O\\O&B^{*}\end{pmatrix}=\mathrm r(A)+\mathrm r(B^{*})=2+1=3 .$$
选 **B**。

@考点
$A$ 可逆时 $\mathrm r(AB)=\mathrm r(B)$；伴随矩阵的秩公式（$n$、$1$、$0$ 三种情形）；分块对角矩阵的秩等于各块秩之和。

易混：只有分块**对角**（或反对角）时秩才可加；对分块三角矩阵 $\begin{pmatrix}A&C\\O&B\end{pmatrix}$ 只有不等式 $\mathrm r\geqslant\mathrm r(A)+\mathrm r(B)$，一般不取等。

@易错
1. 对 A、C、D 也套用"对角块秩相加"。
2. 由 $\mathrm r(AB)=1$ 直接断定 $\mathrm r(A)=1$。
3. 伴随矩阵的秩公式记错（$\mathrm r(A)=n-1$ 时 $\mathrm r(A^{*})=1$，$\mathrm r(A)<n-1$ 时为 $0$）。
4. 行列式展开算错（第三列的代数余子式带负号）。

[37]
@题目
设函数 $y=f(x)$ 由
$$\begin{cases}x=\displaystyle\int_{0}^{t}2e^{-u^{2}}\,\mathrm{d}u\\[0pt] y=\displaystyle\int_{0}^{t}\sin(t-u)\,\mathrm{d}u\end{cases}$$
确定，则当 $x\to 0$ 时，$f(x)$ 是 $x^{2}$ 的（　）.
A. 高阶无穷小　　B. 等价无穷小　　C. 同阶但不等价无穷小　　D. 低阶无穷小

@切入点
要比较 $f(x)$ 与 $x^{2}$ 的阶，而 $x$ 与 $y$ 都用参数 $t$ 表示，所以思路是：**分别求出 $x$ 与 $y$ 关于 $t$ 的等价无穷小，再消去 $t$**。

$x$ 的部分很直接：
$$x=\int_{0}^{t}2\mathrm e^{-u^{2}}du\sim\int_{0}^{t}2 du=2t (t\to0) $$
（被积函数在 $0$ 处取值 $2$，变限积分与 $2t$ 等价）。

$y$ 的部分有一个小技巧：$\displaystyle\int_0^t\sin(t-u)du$ 里被积函数含参数 $t$，不能直接用变限积分的估计。**换元 $s=t-u$** 把它化成普通的定积分：
$$y=\int_{0}^{t}\sin s ds=1-\cos t\sim\frac{t^{2}}{2} .$$
这一步是本题的关键。

最后消参数：由 $x\sim2t$ 得 $t\sim\dfrac x2$，故
$$y\sim\frac12(\frac x2)^{2}=\frac{x^{2}}{8} .$$
系数 $\frac18\neq1$ 且非零，故 $f(x)$ 与 $x^{2}$ **同阶但不等价**。

@解答
当 $t\to0$ 时（此时 $x\to0$）：
$$x=\int_{0}^{t}2\mathrm e^{-u^{2}}du\sim2t ,$$
（因被积函数连续且在 $0$ 处取值 $2$）。

对 $y$ 作换元 $s=t-u$：
$$y=\int_{0}^{t}\sin(t-u)du=\int_{0}^{t}\sin s ds=1-\cos t\sim\frac{t^{2}}{2} .$$

由 $x\sim2t$ 得 $t\sim\dfrac x2$，故
$$f(x)=y\sim\frac{1}{2}(\frac x2)^{2}=\frac{x^{2}}{8} ,$$
即
$$\lim_{x\to0}\frac{f(x)}{x^{2}}=\frac18\neq0,1 .$$
故 $f(x)$ 与 $x^{2}$ 是同阶但不等价的无穷小，选 **C**。

@考点
参数方程确定的函数的无穷小比较；变限积分的等价无穷小 $\int_0^tg(u)du\sim g(0)t$（$g$ 连续，$g(0)\neq0$）；被积函数含参数时用换元化为普通定积分；$1-\cos t\sim\frac{t^{2}}{2}$。

易混：同阶（极限为非零常数）、等价（极限为 $1$）、高阶（极限为 $0$）、低阶（极限为 $\infty$）四种关系；本题极限是 $\frac18$，属"同阶不等价"。

@易错
1. 对 $\int_0^t\sin(t-u)du$ 直接用"变限积分 $\sim$ 被积函数在 $0$ 处的值乘 $t$"（被积函数含 $t$，公式不适用）。
2. 消参数时忘记平方（$t\sim\frac x2$ 代入 $t^{2}$ 要得 $\frac{x^{2}}{4}$）。
3. 把 $x\sim2t$ 记成 $x\sim t$。
4. 认为系数不是 $1$ 就是"高阶"。

[38]
@题目
设 $f(x)$ 在 $[0, +\infty)$ 上可导，$\lim\limits_{x \to +\infty} f(x) = b\ (b \neq 0)$，$y(x)$ 为方程 $y' + ay = f(x)\ (a > 0)$ 的任一解，则 $y = y(x)$ 有水平渐近线（　　）.
A. $y = ab$　　B. $y = -ab$　　C. $y = \dfrac{b}{a}$　　D. $y = \dfrac{a}{b}$

@切入点
方程是一阶线性的，通解公式
$$y=\mathrm e^{-ax}[C+\int_{0}^{x}\mathrm e^{as}f(s)ds]$$
一写出来，问题就变成求 $x\to+\infty$ 时这个式子的极限。

分两块看：
- $C\mathrm e^{-ax}\to0$（因 $a>0$）——这说明**任意解**都有相同的水平渐近线，与常数 $C$ 无关，这正是题目说"任一解"的底气。
- $\dfrac{\int_0^x\mathrm e^{as}f(s)ds}{\mathrm e^{ax}}$ 是 $\dfrac{\infty}{\infty}$ 型（因 $f\to b\neq0$，被积函数中 $\mathrm e^{as}\to\infty$ 使分子发散）。用洛必达：
$$\lim_{x\to+\infty}\frac{\mathrm e^{ax}f(x)}{a\mathrm e^{ax}}=\frac{\lim f(x)}{a}=\frac ba .$$

于是水平渐近线是 $y=\dfrac ba$。

也可以从方程本身做**直观判断**：若 $y$ 趋于常数 $L$，则 $y'\to0$，方程给出 $aL=b$，即 $L=\frac ba$——这个"稳态分析"能秒选答案，但严格证明还是要用上面的极限计算（因为要先说明极限存在）。

@解答
方程 $y'+ay=f(x)$ 的通解为
$$y(x)=\mathrm e^{-ax}[C+\int_{0}^{x}\mathrm e^{as}f(s)ds] .$$
因 $a>0$，$C\mathrm e^{-ax}\to0$。又 $f(x)\to b\neq0$，故 $\displaystyle\int_0^x\mathrm e^{as}f(s)ds\to\infty$，属 $\dfrac\infty\infty$ 型，由洛必达法则
$$\lim_{x\to+\infty}\frac{\int_{0}^{x}\mathrm e^{as}f(s)ds}{\mathrm e^{ax}}=\lim_{x\to+\infty}\frac{\mathrm e^{ax}f(x)}{a\mathrm e^{ax}}=\frac{b}{a} .$$
因此
$$\lim_{x\to+\infty}y(x)=\frac ba ,$$
即曲线 $y=y(x)$ 有水平渐近线 $y=\dfrac ba$。选 **C**。

（直观检验：若 $y\to L$ 则 $y'\to0$，代入方程得 $aL=b$，$L=\frac ba$。）

@考点
一阶线性微分方程的通解公式；水平渐近线即 $x\to\infty$ 时函数的极限；洛必达法则处理"变限积分比指数"的 $\frac\infty\infty$ 型。

易混：水平渐近线与解中的任意常数无关（因为 $\mathrm e^{-ax}\to0$ 把常数"吃掉"了），这是 $a>0$ 的作用；若 $a<0$ 则解发散，没有水平渐近线。

@易错
1. 凭感觉选 A 或 B（把 $a$ 与 $\frac1a$ 弄反）。
2. 用洛必达时忘了分子确实趋于无穷。
3. 忽略 $C\mathrm e^{-ax}$ 项而直接说"与 $C$ 无关"（应当说明它趋于 $0$）。
4. 把 $f(x)\to b$ 误用成 $f(x)\equiv b$（虽然结论相同，但推理要严谨）。

[39]
@题目
设 $X_1,X_2,\cdots,X_n\ (n>1)$ 为来自总体 $X \sim N(\mu,\sigma^2)$ 的简单随机样本，其中 $\mu$ 已知，$\sigma > 0$，若
$$\hat{\sigma} = k\sum_{i=1}^{n}|X_i - \mu|$$
是 $\sigma$ 的无偏估计量，则 $k = \underline{\qquad\qquad}$。

@切入点
无偏估计的含义是 $E\hat\sigma=\sigma$，所以只需算出 $E|X_i-\mu|$，再解出 $k$。

关键是这个期望：$X_i-\mu\sim N(0,\sigma^{2})$，所以要算的是**正态变量绝对值的期望**。设 $Z\sim N(0,1)$，则 $X_i-\mu=\sigma Z$，
$$E|X_i-\mu|=\sigma E|Z| ,$$
而
$$E|Z|=2\int_{0}^{+\infty}z\cdot\frac{1}{\sqrt{2\pi}}\mathrm e^{-\frac{z^{2}}{2}}dz=\frac{2}{\sqrt{2\pi}}[-\mathrm e^{-\frac{z^{2}}{2}}]_{0}^{+\infty}=\frac{2}{\sqrt{2\pi}}=\sqrt{\frac2\pi} .$$
这个 $E|Z|=\sqrt{\frac2\pi}$ 值得背下来（推导只需一次凑微分）。

于是
$$E\hat\sigma=k\sum_{i=1}^{n}E|X_i-\mu|=kn\sigma\sqrt{\frac2\pi}=\sigma\Longrightarrow k=\frac1n\sqrt{\frac\pi2} .$$

注意题设 $\mu$ **已知**，所以 $|X_i-\mu|$ 是可以算出来的统计量；若 $\mu$ 未知就要用 $\overline X$ 代替，系数会不同。

@解答
因 $X_i\sim N(\mu,\sigma^{2})$，有 $X_i-\mu\sim N(0,\sigma^{2})$。记 $Z\sim N(0,1)$，则 $X_i-\mu$ 与 $\sigma Z$ 同分布，故
$$E|X_i-\mu|=\sigma E|Z| .$$
而
$$E|Z|=\int_{-\infty}^{+\infty}|z|\frac{1}{\sqrt{2\pi}}\mathrm e^{-\frac{z^{2}}{2}}dz=\frac{2}{\sqrt{2\pi}}\int_{0}^{+\infty}z\mathrm e^{-\frac{z^{2}}{2}}dz=\frac{2}{\sqrt{2\pi}}=\sqrt{\frac2\pi} ,$$
故 $E|X_i-\mu|=\sigma\sqrt{\dfrac2\pi}$。于是
$$E\hat\sigma=k\sum_{i=1}^{n}E|X_i-\mu|=kn\sigma\sqrt{\frac2\pi} .$$
令 $E\hat\sigma=\sigma$ 得
$$kn\sqrt{\frac2\pi}=1\Longrightarrow k=\frac{1}{n}\sqrt{\frac\pi2} .$$

@考点
无偏估计的定义 $E\hat\theta=\theta$；正态变量绝对值的期望 $E|Z|=\sqrt{\frac2\pi}$（$Z\sim N(0,1)$）；标准化 $X_i-\mu=\sigma Z$。

易混：$E|X-\mu|=\sigma\sqrt{\frac2\pi}$ 与 $E(X-\mu)^{2}=\sigma^{2}$ 是两个不同的量；前者叫"平均绝对偏差"，后者是方差。

@易错
1. 把 $E|X_i-\mu|$ 算成 $0$（那是 $E(X_i-\mu)$）或 $\sigma$。
2. $E|Z|$ 记成 $\frac{2}{\pi}$ 或 $\frac{1}{\sqrt{2\pi}}$。
3. 忘记求和号带来的因子 $n$。
4. $k$ 写成 $\frac1n\sqrt{\frac2\pi}$（取了倒数的倒数）。

[40]
@题目
求下列级数的收敛域：
（Ⅰ）$\sum\limits_{n=1}^{\infty} \dfrac{(-1)^n x^n}{2^n \sqrt{n}}$；
（Ⅱ）$\sum\limits_{n=1}^{\infty} \dfrac{(x - 3)^n}{n \cdot 3^n}$；
（Ⅲ）$\sum\limits_{n=1}^{\infty} (-1)^n n^n x^n$；
（Ⅳ）$\sum\limits_{n=1}^{\infty} \dfrac{x^{2n-1}}{3^n}$.

@切入点
求收敛域是"**先半径、后端点**"的两步走，每一小题的差别只在这两步的细节上：

（Ⅰ）系数含 $\dfrac{1}{2^{n}\sqrt n}$，根值法给出 $R=2$。端点要分别判：$x=2$ 时成为交错级数 $\sum\frac{(-1)^{n}}{\sqrt n}$（莱布尼茨，收敛）；$x=-2$ 时两个 $(-1)^{n}$ 相乘变成正项 $\sum\frac{1}{\sqrt n}$（$p=\frac12<1$，发散）。**两个端点表现相反**，这正是本小题的考点。

（Ⅱ）注意中心是 $3$ 不是 $0$，半径 $R=3$，区间 $(0,6)$。端点同样一个收敛一个发散。

（Ⅲ）系数 $n^{n}$ 增长极快，$\sqrt[n]{n^{n}}=n\to\infty$，故 $R=0$，收敛域只有一个点 $\{0\}$。看到 $n^{n}$、$n!$ 这类超指数增长的系数就要警惕半径可能为 $0$。

（Ⅳ）注意这是**缺项级数**（只有奇次幂），不能直接用系数的根值法。正确做法是把它看成关于 $x^{2}$ 的级数：收敛要求 $\dfrac{x^{2}}{3}<1$。端点 $x=\pm\sqrt3$ 时通项 $\dfrac{x^{2n-1}}{3^{n}}=\pm\dfrac{1}{\sqrt3}$ 不趋于 $0$，发散。

@解答
（Ⅰ）$\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{n}x^{n}}{2^{n}\sqrt n}$。由 $\sqrt[n]{\dfrac{1}{2^{n}\sqrt n}}\to\dfrac12$ 得 $R=2$。
$x=2$：级数为 $\sum\dfrac{(-1)^{n}}{\sqrt n}$，由莱布尼茨判别法收敛；
$x=-2$：级数为 $\sum\dfrac{1}{\sqrt n}$，$p=\dfrac12<1$，发散。
收敛域为 $(-2,2]$。

（Ⅱ）$\displaystyle\sum_{n=1}^{\infty}\frac{(x-3)^{n}}{n\cdot3^{n}}$。中心为 $3$，$R=3$，区间 $(0,6)$。
$x=6$：级数为 $\sum\dfrac1n$，发散；
$x=0$：级数为 $\sum\dfrac{(-1)^{n}}{n}$，收敛。
收敛域为 $[0,6)$。

（Ⅲ）$\displaystyle\sum_{n=1}^{\infty}(-1)^{n}n^{n}x^{n}$。由 $\sqrt[n]{n^{n}}=n\to+\infty$ 得 $R=0$，收敛域为 $\{0\}$。

（Ⅳ）$\displaystyle\sum_{n=1}^{\infty}\frac{x^{2n-1}}{3^{n}}$。这是缺项级数，视为关于 $x^{2}$ 的等比型：收敛要求 $\dfrac{x^{2}}{3}<1$，即 $|x|<\sqrt3$。
$x=\pm\sqrt3$：通项为 $\dfrac{(\pm\sqrt3)^{2n-1}}{3^{n}}=\pm\dfrac{1}{\sqrt3}$，不趋于 $0$，发散。
收敛域为 $(-\sqrt3,\sqrt3)$。

@考点
收敛半径的根值法与比值法；端点处用莱布尼茨判别法或 $p$ 级数判敛；非零中心的幂级数；缺项幂级数要按 $x$ 的实际幂次（或换元）处理；$R=0$ 与 $R=+\infty$ 的极端情形。

易混：缺项级数（如只含 $x^{2n}$ 或 $x^{2n-1}$）**不能**直接用 $\frac{1}{R}=\lim\sqrt[n]{|a_n|}$（那里的 $a_n$ 指 $x^{n}$ 的系数，缺项时大量系数为 $0$）；正确做法是换元或用比值法直接对通项做。

@易错
1. （Ⅰ）两个端点判成一样。
2. （Ⅱ）忘记中心是 $3$，把区间写成 $(-3,3)$。
3. （Ⅲ）误以为 $R=+\infty$。
4. （Ⅳ）直接套系数公式得出 $R=3$。

[41]
@题目
设 $L$ 为 $x^2+y^2=R^2\ (y\geqslant 0)$ 上由点 $A(-\tfrac{R}{\sqrt2},\tfrac{R}{\sqrt2})$ 到点 $B(R,0)$ 的一段弧，则
$$\int_L y\,ds=\underline{\qquad},\qquad \int_L y\,dx=\underline{\qquad}$$

@切入点
两个积分**类型不同**，处理方式也不同，这正是本题的考点：

- $\displaystyle\int_Ly ds$ 是**第一类**（对弧长），与方向无关，$ds>0$。用参数 $\theta$ 时 $ds=R d\theta$，积分限按 $\theta$ 从小到大写（或者说取 $|d\theta|$）。
- $\displaystyle\int_Ly dx$ 是**第二类**（对坐标），与方向有关。必须按题目给定的方向（从 $A$ 到 $B$）确定参数的起止：$A$ 对应 $\theta=\frac{3\pi}{4}$，$B$ 对应 $\theta=0$，所以 $\theta$ 从 $\frac{3\pi}{4}$ **减到** $0$，积分下限是 $\frac{3\pi}{4}$、上限是 $0$。

参数化：$x=R\cos\theta$，$y=R\sin\theta$，则 $dx=-R\sin\theta d\theta$，$ds=R d\theta$。

确定端点对应的 $\theta$：$A(-\frac{R}{\sqrt2},\frac{R}{\sqrt2})$ 在第二象限且 $|x|=|y|$，故 $\theta=\frac{3\pi}{4}$；$B(R,0)$ 对应 $\theta=0$。

@解答
取参数方程 $x=R\cos\theta$，$y=R\sin\theta$。点 $A(-\dfrac{R}{\sqrt2},\dfrac{R}{\sqrt2})$ 对应 $\theta=\dfrac{3\pi}{4}$，点 $B(R,0)$ 对应 $\theta=0$。

**第一类积分**（与方向无关，$ds=R d\theta$）：
$$\int_Ly ds=\int_{0}^{\frac{3\pi}{4}}R\sin\theta\cdot R d\theta=R^{2}[-\cos\theta]_{0}^{\frac{3\pi}{4}}=R^{2}(\frac{\sqrt2}{2}+1)=\frac{(2+\sqrt2)R^{2}}{2} .$$

**第二类积分**（按 $A\to B$，$\theta$ 由 $\dfrac{3\pi}{4}$ 变到 $0$，$dx=-R\sin\theta d\theta$）：
$$\int_Ly dx=\int_{\frac{3\pi}{4}}^{0}R\sin\theta\cdot(-R\sin\theta)d\theta=R^{2}\int_{0}^{\frac{3\pi}{4}}\sin^{2}\theta d\theta .$$
由
$$\int_{0}^{\frac{3\pi}{4}}\sin^{2}\theta d\theta=[\frac\theta2-\frac{\sin2\theta}{4}]_{0}^{\frac{3\pi}{4}}=\frac{3\pi}{8}+\frac14 ,$$
得
$$\int_Ly dx=R^{2}(\frac{3\pi}{8}+\frac14)=\frac{(3\pi+2)R^{2}}{8} .$$

@考点
第一类与第二类曲线积分的区别（是否与方向有关）；圆的参数化与端点对应的参数值；$ds=R d\theta$ 与 $dx=-R\sin\theta d\theta$；$\sin^{2}\theta$ 的积分。

易混：第一类积分的积分限必须"从小到大"（因为 $ds>0$）；第二类积分的积分限由**曲线方向**决定，可以上限小于下限。

@易错
1. 两个积分都按同一个方向处理，导致第二类差一个符号。
2. 端点 $A$ 对应的 $\theta$ 取成 $\frac\pi4$ 或 $-\frac{3\pi}{4}$。
3. $dx$ 忘记负号。
4. $\sin2\theta$ 在 $\theta=\frac{3\pi}{4}$ 处的值算错（$\sin\frac{3\pi}{2}=-1$）。

[42]
@题目
设 $X$ 与 $Y$ 相互独立，且均服从 $N\!\big(1,\tfrac{1}{2}\big)$，求 $D(|X-Y|)$.

@切入点
求 $D(|X-Y|)$，第一步当然是**先弄清 $X-Y$ 的分布**，把两个变量压成一个。

$X,Y$ 独立且同服从 $N(1,\frac12)$（注意第二个参数是**方差**），故
$$X-Y\sim N(1-1,\ \frac12+\frac12)=N(0,1) ,$$
恰是标准正态！题目把方差设成 $\frac12$ 就是为了凑出这个漂亮的结果。（再次提醒：差的方差是两个方差**相加**。）

第二步用方差的定义式
$$D|Z|=E|Z|^{2}-(E|Z|)^{2}=EZ^{2}-(E|Z|)^{2} ,$$
这里 $|Z|^{2}=Z^{2}$，所以第一项就是 $EZ^{2}=DZ+(EZ)^{2}=1$；第二项用 $E|Z|=\sqrt{\frac2\pi}$。

于是 $D|Z|=1-\dfrac2\pi$。

@解答
因 $X,Y$ 相互独立且都服从 $N(1,\dfrac12)$（第二个参数为方差），
$$E(X-Y)=0,  D(X-Y)=DX+DY=\frac12+\frac12=1 ,$$
故 $Z:=X-Y\sim N(0,1)$。

于是
$$E|Z|^{2}=EZ^{2}=DZ+(EZ)^{2}=1 ,$$
$$E|Z|=\frac{2}{\sqrt{2\pi}}\int_{0}^{+\infty}z\mathrm e^{-\frac{z^{2}}{2}}dz=\sqrt{\frac2\pi} ,$$
因此
$$D(|X-Y|)=E|Z|^{2}-(E|Z|)^{2}=1-\frac2\pi .$$

@考点
独立正态变量线性组合的分布；$D(X-Y)=DX+DY$（独立时）；方差的定义式 $DW=EW^{2}-(EW)^{2}$；$E|Z|=\sqrt{\frac2\pi}$（$Z\sim N(0,1)$）。

易混：$E|Z|^{2}=EZ^{2}=1$，但 $(E|Z|)^{2}=\frac2\pi\neq1$；绝对值的平方与平方的绝对值相同，但期望的平方与平方的期望不同。

@易错
1. 认为 $D|Z|=DZ=1$（绝对值改变了分布）。
2. $D(X-Y)$ 算成 $0$。
3. 把 $N(1,\frac12)$ 的 $\frac12$ 当成标准差。
4. $E|Z|$ 记错。

[43]
@题目
求下列极限：
（Ⅰ）$\displaystyle\lim_{n\to\infty}\Big(\frac{1}{n^{2}+n+1}+\frac{2}{n^{2}+n+2}+\cdots+\frac{n}{n^{2}+n+n}\Big)$；
（Ⅱ）$\displaystyle\lim_{n\to\infty}\big[\sqrt{1+2+\cdots+n}-\sqrt{1+2+\cdots+(n-1)}\big]$；
（Ⅲ）$\displaystyle\lim_{n\to\infty}\sum_{k=1}^{n}\frac{1}{4k^{2}-1}$；
（Ⅳ）$\displaystyle\lim_{n\to\infty}\sqrt{1+\frac{1}{2}+\frac{1}{3}+\cdots+\frac{1}{n}}$.

@切入点
四个小题都是"数列极限"，但用的工具各不相同，识别类型是关键：

（Ⅰ）和式中有 $n$ 项，每项的分母都在 $n^{2}+n+1$ 与 $n^{2}+2n$ 之间——分母的变化范围相对于主部 $n^{2}$ 是**低阶**的，所以用**夹逼准则**：把所有分母统一放大／缩小，中间的分子 $\sum k=\frac{n(n+1)}{2}$ 照算，两端极限都是 $\frac12$。

（Ⅱ）两个根式相减且都趋于无穷，是 $\infty-\infty$ 型，标准手法是**有理化**（乘共轭式）。

（Ⅲ）通项 $\dfrac{1}{4k^{2}-1}=\dfrac{1}{(2k-1)(2k+1)}$ 可**裂项**，部分和望远镜求和。

（Ⅳ）括号内是调和级数的部分和 $H_n$，它发散到 $+\infty$，故整个式子趋于 $+\infty$。

各用各的工具，不要混用——例如（Ⅰ）不能裂项，（Ⅲ）不必夹逼。

@解答
（Ⅰ）记 $S_n=\displaystyle\sum_{k=1}^{n}\frac{k}{n^{2}+n+k}$。因 $1\leqslant k\leqslant n$，分母介于 $n^{2}+n+1$ 与 $n^{2}+2n$ 之间，故
$$\frac{\sum_{k=1}^{n}k}{n^{2}+2n}\leqslant S_n\leqslant\frac{\sum_{k=1}^{n}k}{n^{2}+n+1} ,$$
即
$$\frac{n(n+1)}{2(n^{2}+2n)}\leqslant S_n\leqslant\frac{n(n+1)}{2(n^{2}+n+1)} .$$
两端当 $n\to\infty$ 时都趋于 $\dfrac12$，由夹逼准则
$$\lim_{n\to\infty}S_n=\frac12 .$$

（Ⅱ）由 $1+2+\cdots+n=\dfrac{n(n+1)}{2}$，
$$\sqrt{\frac{n(n+1)}{2}}-\sqrt{\frac{n(n-1)}{2}}=\frac{\frac{n(n+1)}{2}-\frac{n(n-1)}{2}}{\sqrt{\frac{n(n+1)}{2}}+\sqrt{\frac{n(n-1)}{2}}}=\frac{n}{\sqrt{\frac{n(n+1)}{2}}+\sqrt{\frac{n(n-1)}{2}}} .$$
分母 $\sim2\cdot\dfrac{n}{\sqrt2}=\sqrt2 n$，故极限为
$$\frac{1}{\sqrt2}=\frac{\sqrt2}{2} .$$

（Ⅲ）裂项：
$$\frac{1}{4k^{2}-1}=\frac{1}{(2k-1)(2k+1)}=\frac12(\frac{1}{2k-1}-\frac{1}{2k+1}) ,$$
故
$$\sum_{k=1}^{n}\frac{1}{4k^{2}-1}=\frac12(1-\frac{1}{2n+1})\to\frac12 .$$

（Ⅳ）括号内为调和级数的部分和 $H_n=1+\dfrac12+\cdots+\dfrac1n$，它发散到 $+\infty$，故
$$\lim_{n\to\infty}\sqrt{H_n}=+\infty .$$

**说明（题干需核对）**：若原题的根号是 $n$ 次根 $\sqrt[n]{H_n}$，则由 $1\leqslant H_n\leqslant1+\ln n$ 及 $\sqrt[n]{1+\ln n}\to1$ 得极限为 $1$。请对照原书确认根号的次数。

@考点
夹逼准则（和式中分母可统一估计时）；$\infty-\infty$ 型的有理化；裂项相消求和；调和级数发散。

易混：（Ⅰ）也可以用定积分定义吗？不行——通项不是 $\frac1nf(\frac kn)$ 的标准形式（分母是 $n^{2}$ 量级），夹逼是最合适的工具。

@易错
1. （Ⅰ）把和式当成 $n$ 项相加、每项趋于 $0$ 就断定极限为 $0$。
2. （Ⅱ）不有理化，直接把两个根号都换成 $\frac{n}{\sqrt2}$，得到 $0$。
3. （Ⅲ）裂项时漏掉系数 $\frac12$。
4. （Ⅳ）误以为 $H_n$ 收敛。

[44]
@题目
$$I=\int_{0}^{1}\frac{1}{3}x^{-\frac{2}{3}}\mathrm{d}x\int_{\arctan x}^{\frac{\pi}{4}}\csc 2y\,\mathrm{d}y=\underline{\qquad}$$

@切入点
这是一个**累次积分**，直接按给定次序做的话，内层
$$\int_{\arctan x}^{\frac\pi4}\csc2y dy$$
虽然能积出（原函数是 $\frac12\ln|\tan y|$），但代回后外层会出现 $x^{-2/3}\ln(\tan(\arctan x))=x^{-2/3}\ln x$ 之类，还要处理反常性。**交换积分次序**要省事得多。

交换次序的第一步永远是**画出积分区域**：原次序给出
$$0<x<1,  \arctan x<y<\frac\pi4 .$$
由 $y>\arctan x$ 即 $x<\tan y$，且 $x>0$；又 $x\in(0,1)$ 对应 $\arctan x\in(0,\frac\pi4)$，所以 $y$ 的总范围是 $(0,\frac\pi4)$。于是新次序为
$$0<y<\frac\pi4,  0<x<\tan y .$$

交换后内层 $\displaystyle\int_0^{\tan y}\frac13x^{-2/3}dx=[x^{1/3}]_0^{\tan y}=(\tan y)^{1/3}$，干净利落（注意这是收敛的反常积分）。外层
$$\int_{0}^{\frac\pi4}\frac{(\tan y)^{\frac13}}{\sin2y}dy $$
再令 $t=\tan y$：由 $\sin2y=\dfrac{2t}{1+t^{2}}$、$dy=\dfrac{dt}{1+t^{2}}$，整个式子化为 $\dfrac12\int_0^1t^{-2/3}dt$，一步算完。

@解答
原积分的区域为
$$D:\ 0<x<1,\ \arctan x<y<\frac\pi4 ,$$
即 $0<y<\dfrac\pi4$，$0<x<\tan y$。交换积分次序：
$$I=\int_{0}^{\frac\pi4}\csc2y[\int_{0}^{\tan y}\frac13x^{-\frac23}dx]dy .$$
内层
$$\int_{0}^{\tan y}\frac13x^{-\frac23}dx=[x^{\frac13}]_{0}^{\tan y}=(\tan y)^{\frac13} ,$$
故
$$I=\int_{0}^{\frac\pi4}\frac{(\tan y)^{\frac13}}{\sin2y}dy .$$
令 $t=\tan y$，则 $\sin2y=\dfrac{2t}{1+t^{2}}$，$dy=\dfrac{dt}{1+t^{2}}$，$y:0\to\dfrac\pi4$ 对应 $t:0\to1$：
$$I=\int_{0}^{1}t^{\frac13}\cdot\frac{1+t^{2}}{2t}\cdot\frac{dt}{1+t^{2}}=\frac12\int_{0}^{1}t^{-\frac23}dt=\frac12\cdot[3t^{\frac13}]_{0}^{1}=\frac32 .$$

@考点
累次积分交换次序（先画区域、再按新次序定限）；反常积分 $\int_0^1x^{-2/3}dx$ 收敛（$p=\frac23<1$）；万能代换 $t=\tan y$ 及 $\sin2y=\frac{2t}{1+t^{2}}$。

易混：交换次序时新的外层变量范围要由**整个区域**在该坐标轴上的投影确定（本题 $y\in(0,\frac\pi4)$），不能照搬原来的内层限。

@易错
1. 不交换次序，硬算内层的 $\csc2y$ 积分后陷入复杂的外层。
2. 交换后 $x$ 的上限写成 $1$ 或 $\arctan y$。
3. 忽略 $x\to0^{+}$ 时 $x^{-2/3}$ 的反常性（它可积，但应当交代）。
4. 代换 $t=\tan y$ 后忘记换 $dy$。

[45]
@题目
设 $A$ 是 3 阶实对称矩阵，$B=(\alpha_1,\alpha_2,\alpha_3)$ 是 3 阶可逆矩阵，且 $AB=(\alpha_1,\ \alpha_2-2\alpha_3,\ \alpha_3-2\alpha_2)$，记 $X=(x_1,x_2,x_3)^{\mathrm T}$，则二次型 $f(x_1,x_2,x_3)=\mathrm{tr}(AXX^{\mathrm T})$ 的规范形为（　　）.
A. $y_1^2-y_2^2-y_3^2$
B. $y_1^2+y_2^2-y_3^2$
C. $y_1^2+y_2^2+y_3^2$
D. $-y_1^2-y_2^2-y_3^2$

@切入点
两步：先把 $f$ 认出来，再把 $A$ 的特征值求出来。

**第一步**：$\mathrm{tr}(AXX^{\mathrm T})$ 看着陌生，但用迹的交换性 $\mathrm{tr}(MN)=\mathrm{tr}(NM)$：
$$\mathrm{tr}(AXX^{\mathrm T})=\mathrm{tr}(X^{\mathrm T}AX)=X^{\mathrm T}AX $$
（因为 $X^{\mathrm T}AX$ 是 $1$ 阶矩阵，即一个数，其迹就是它本身）。所以 $f$ 就是以 $A$ 为矩阵的普通二次型。

**第二步**：规范形由正、负惯性指数决定，也就是由 $A$ 的特征值的**符号**决定。条件
$$AB=(\alpha_1,\ \alpha_2-2\alpha_3,\ \alpha_3-2\alpha_2)$$
正是"$A$ 作用在基 $\alpha_1,\alpha_2,\alpha_3$ 上"的描述，把右端各列用 $\alpha_i$ 的系数排成矩阵 $M$，就得到
$$AB=BM,  M=\begin{pmatrix}1&0&0\\0&1&-2\\0&-2&1\end{pmatrix} .$$
$B$ 可逆，故 $A=BMB^{-1}$，**$A$ 与 $M$ 相似**，特征值相同。$M$ 是分块对角的，特征值一眼可得：$1$ 以及 $\begin{pmatrix}1&-2\\-2&1\end{pmatrix}$ 的特征值 $3,-1$。

于是两正一负，规范形 $y_1^{2}+y_2^{2}-y_3^{2}$。

@解答
因 $X^{\mathrm T}AX$ 是一个数，由迹的性质
$$f(x_1,x_2,x_3)=\mathrm{tr}(AXX^{\mathrm T})=\mathrm{tr}(X^{\mathrm T}AX)=X^{\mathrm T}AX ,$$
即 $f$ 是以实对称矩阵 $A$ 为矩阵的二次型。

由 $AB=(\alpha_1,\ \alpha_2-2\alpha_3,\ \alpha_3-2\alpha_2)$，把各列用 $\alpha_1,\alpha_2,\alpha_3$ 表示，得
$$AB=BM,  M=\begin{pmatrix}1&0&0\\0&1&-2\\0&-2&1\end{pmatrix} .$$
$B$ 可逆，故 $A=BMB^{-1}$，$A$ 与 $M$ 相似，特征值相同。$M$ 的特征值：由第一块得 $1$；由 $\begin{pmatrix}1&-2\\-2&1\end{pmatrix}$ 得 $1\pm2=3,-1$。故 $A$ 的特征值为
$$1,\ 3,\ -1 ,$$
正惯性指数 $p=2$，负惯性指数 $q=1$。所以规范形为
$$y_1^{2}+y_2^{2}-y_3^{2} .$$
选 **B**。

@考点
迹的循环性 $\mathrm{tr}(MN)=\mathrm{tr}(NM)$；$1$ 阶矩阵的迹就是它本身；由 $AB=BM$ 得相似关系；相似保持特征值；实对称二次型的规范形由正负惯性指数决定。

易混：写 $M$ 时容易转置——$M$ 的**第 $j$ 列**是 $AB$ 第 $j$ 列用 $\alpha_1,\alpha_2,\alpha_3$ 表示的系数；核对办法是验算 $BM$ 的第 $j$ 列。

@易错
1. 不化简 $\mathrm{tr}(AXX^{\mathrm T})$，被形式吓住。
2. $M$ 写成转置。
3. 由相似推出的是特征值相同，误用成"规范形由相似决定"（实对称时相似对角化与合同标准形的符号一致，故结论成立，但理由要说清）。
4. 正负个数数反，选 A。

[46]
@题目
求椭球面 $\dfrac{x^{2}}{a^{2}}+\dfrac{y^{2}}{b^{2}}+\dfrac{z^{2}}{c^{2}}=1\ (a,b,c>0)$ 在第一卦限上的切平面与三个坐标面围成的四面体的最小体积.

@切入点
这是"先写出目标函数、再做条件最值"的标准应用题。

**第一步**：写体积。椭球面上点 $(x_0,y_0,z_0)$ 处的切平面有现成的公式（把方程中的 $x^{2}$ 换成 $xx_0$ 等）：
$$\frac{xx_0}{a^{2}}+\frac{yy_0}{b^{2}}+\frac{zz_0}{c^{2}}=1 .$$
三个截距是 $\dfrac{a^{2}}{x_0},\dfrac{b^{2}}{y_0},\dfrac{c^{2}}{z_0}$，四面体体积
$$V=\frac16\cdot\frac{a^{2}}{x_0}\cdot\frac{b^{2}}{y_0}\cdot\frac{c^{2}}{z_0}=\frac{a^{2}b^{2}c^{2}}{6x_0y_0z_0} .$$

**第二步**：$V$ 最小 $\Leftrightarrow x_0y_0z_0$ 最大，约束是 $\dfrac{x_0^{2}}{a^{2}}+\dfrac{y_0^{2}}{b^{2}}+\dfrac{z_0^{2}}{c^{2}}=1$。这时**均值不等式**比拉格朗日乘数法快得多：
$$1=\frac{x_0^{2}}{a^{2}}+\frac{y_0^{2}}{b^{2}}+\frac{z_0^{2}}{c^{2}}\geqslant3\sqrt[3]{\frac{x_0^{2}y_0^{2}z_0^{2}}{a^{2}b^{2}c^{2}}} ,$$
等号当三项相等（即都等于 $\frac13$）时取到，此时
$$x_0y_0z_0\leqslant\frac{abc}{3\sqrt3} .$$
代回即得最小体积。

"约束是平方和、目标是乘积"这种配置，就是均值不等式的主场。

@解答
设切点为 $(x_0,y_0,z_0)$（第一卦限，故 $x_0,y_0,z_0>0$），切平面为
$$\frac{xx_0}{a^{2}}+\frac{yy_0}{b^{2}}+\frac{zz_0}{c^{2}}=1 ,$$
三个坐标轴上的截距分别为 $\dfrac{a^{2}}{x_0},\dfrac{b^{2}}{y_0},\dfrac{c^{2}}{z_0}$，故四面体体积
$$V=\frac16\cdot\frac{a^{2}}{x_0}\cdot\frac{b^{2}}{y_0}\cdot\frac{c^{2}}{z_0}=\frac{a^{2}b^{2}c^{2}}{6x_0y_0z_0} .$$

要 $V$ 最小即 $x_0y_0z_0$ 最大。由均值不等式与约束条件，
$$1=\frac{x_0^{2}}{a^{2}}+\frac{y_0^{2}}{b^{2}}+\frac{z_0^{2}}{c^{2}}\geqslant3\sqrt[3]{\frac{x_0^{2}y_0^{2}z_0^{2}}{a^{2}b^{2}c^{2}}} ,$$
故
$$\frac{x_0^{2}y_0^{2}z_0^{2}}{a^{2}b^{2}c^{2}}\leqslant\frac{1}{27}\Longrightarrow x_0y_0z_0\leqslant\frac{abc}{3\sqrt3} ,$$
等号当 $\dfrac{x_0^{2}}{a^{2}}=\dfrac{y_0^{2}}{b^{2}}=\dfrac{z_0^{2}}{c^{2}}=\dfrac13$，即
$$x_0=\frac{a}{\sqrt3},  y_0=\frac{b}{\sqrt3},  z_0=\frac{c}{\sqrt3}$$
时取到。因此
$$V_{\min}=\frac{a^{2}b^{2}c^{2}}{6\cdot\frac{abc}{3\sqrt3}}=\frac{3\sqrt3 abc}{6}=\frac{\sqrt3}{2}abc .$$

@考点
二次曲面切平面的"代半"公式；四面体体积 $\frac16|pqr|$（$p,q,r$ 为三截距）；条件极值的均值不等式解法；等号成立条件的确定。

易混：切平面公式 $\frac{xx_0}{a^{2}}+\frac{yy_0}{b^{2}}+\frac{zz_0}{c^{2}}=1$ 只对二次曲面成立，来源是 $\nabla F=(\frac{2x_0}{a^{2}},\frac{2y_0}{b^{2}},\frac{2z_0}{c^{2}})$；用一般的切平面公式推一遍即可确认。

@易错
1. 体积公式漏掉 $\frac16$（写成 $\frac12$ 或 $\frac13$）。
2. 截距算成 $\frac{x_0}{a^{2}}$（取了倒数的倒数）。
3. 均值不等式用反方向。
4. 忘记验证等号可取到（要给出切点坐标）。

[47]
@题目
设 $A_{3\times3}$ 有三个不同的特征值 $\lambda_{1},\lambda_{2},\lambda_{3}$，它们对应的特征向量分别为 $\alpha_{1},\alpha_{2},\alpha_{3}$，令 $\beta = \alpha_{1} + \alpha_{2} + \alpha_{3}$.
（Ⅰ）证明：$\beta, A\beta, A^{2}\beta$ 线性无关；
（Ⅱ）若 $A^{3}\beta = A\beta$，求 $\mathrm{r}(A - E)$.

@切入点
（Ⅰ）要证 $\beta,A\beta,A^{2}\beta$ 线性无关。手上唯一能用的是 $\alpha_1,\alpha_2,\alpha_3$ 线性无关（不同特征值的特征向量），所以把要证的三个向量**全部用 $\alpha_i$ 表示**：
$$\beta=\alpha_1+\alpha_2+\alpha_3,  A\beta=\lambda_1\alpha_1+\lambda_2\alpha_2+\lambda_3\alpha_3,  A^{2}\beta=\lambda_1^{2}\alpha_1+\lambda_2^{2}\alpha_2+\lambda_3^{2}\alpha_3 .$$
设 $k_1\beta+k_2A\beta+k_3A^{2}\beta=0$，按 $\alpha_i$ 归并系数，由 $\alpha_i$ 线性无关得
$$k_1+k_2\lambda_i+k_3\lambda_i^{2}=0 (i=1,2,3) ,$$
这是关于 $k_1,k_2,k_3$ 的齐次方程组，**系数行列式恰是范德蒙德行列式**
$$\prod_{i<j}(\lambda_j-\lambda_i)\neq0$$
（因三个特征值互异），故只有零解。范德蒙德行列式的出现是本问的点睛之笔。

（Ⅱ）$A^{3}\beta=A\beta$ 同样按 $\alpha_i$ 展开：
$$\sum_{i=1}^{3}(\lambda_i^{3}-\lambda_i)\alpha_i=0\Longrightarrow \lambda_i^{3}=\lambda_i\Longrightarrow\lambda_i\in\{0,1,-1\} .$$
三个特征值互异，只能恰好是 $0,1,-1$。于是 $A-E$ 的特征值是 $-1,0,-2$，其中 $0$ 是**单重**的，而 $A$ 可对角化（三个互异特征值），故
$$\mathrm r(A-E)=3-(\lambda=0\ \text{的重数})=3-1=2 .$$

@解答
（Ⅰ）由 $A\alpha_i=\lambda_i\alpha_i$ 得
$$\beta=\alpha_1+\alpha_2+\alpha_3,  A\beta=\sum_{i=1}^{3}\lambda_i\alpha_i,  A^{2}\beta=\sum_{i=1}^{3}\lambda_i^{2}\alpha_i .$$
设
$$k_1\beta+k_2A\beta+k_3A^{2}\beta=0\Longrightarrow \sum_{i=1}^{3}(k_1+k_2\lambda_i+k_3\lambda_i^{2})\alpha_i=0 .$$
因不同特征值对应的特征向量 $\alpha_1,\alpha_2,\alpha_3$ 线性无关，故
$$k_1+k_2\lambda_i+k_3\lambda_i^{2}=0 (i=1,2,3) .$$
该齐次方程组关于 $(k_1,k_2,k_3)$ 的系数行列式为范德蒙德行列式
$$\begin{vmatrix}1&\lambda_1&\lambda_1^{2}\\1&\lambda_2&\lambda_2^{2}\\1&\lambda_3&\lambda_3^{2}\end{vmatrix}=\prod_{1\leqslant i<j\leqslant3}(\lambda_j-\lambda_i)\neq0 ,$$
故 $k_1=k_2=k_3=0$，即 $\beta,A\beta,A^{2}\beta$ 线性无关。

（Ⅱ）由 $A^{3}\beta=A\beta$ 得
$$\sum_{i=1}^{3}(\lambda_i^{3}-\lambda_i)\alpha_i=0\Longrightarrow \lambda_i^{3}-\lambda_i=0\Longrightarrow \lambda_i\in\{0,1,-1\} .$$
又三个特征值互异，故 $\{\lambda_1,\lambda_2,\lambda_3\}=\{0,1,-1\}$。

$A$ 有三个互异特征值，故可对角化，$A\sim\mathrm{diag}(0,1,-1)$，从而
$$A-E\sim\mathrm{diag}(-1,0,-2) ,$$
其中恰有一个零特征值，故
$$\mathrm r(A-E)=2 .$$

@考点
不同特征值的特征向量线性无关；范德蒙德行列式；$A^{k}\beta$ 用特征分解展开；有 $n$ 个互异特征值的矩阵必可对角化；相似保持秩。

易混：$\mathrm r(A-E)$ 等于 $3$ 减去特征值 $1$ 的**几何重数**；因 $A$ 可对角化，几何重数等于代数重数 $1$，故秩为 $2$。若 $A$ 不可对角化就不能这样算。

@易错
1. （Ⅰ）用 $\beta$ 的具体分量去证（分量未知）。
2. 不认识范德蒙德行列式，无法说明系数行列式非零。
3. （Ⅱ）由 $\lambda^{3}=\lambda$ 只写出 $\lambda=0,\pm1$ 而不用"互异"锁定三个值。
4. 忘记说明 $A$ 可对角化就直接算秩。

[48]
@题目
级数
$$\sum_{n=1}^{\infty} \frac{\sqrt{n+1} - \sqrt{n-1}}{n} \sin(n + k)$$
（$k$ 为常数）（　　）.
A. 绝对收敛　　B. 条件收敛　　C. 发散　　D. 收敛性与 $k$ 有关

@切入点
通项里带 $\sin(n+k)$，看起来像交错／振荡级数，容易想去用狄利克雷判别法。但先做一件更省事的事：**估计通项的绝对值**。

$$\sqrt{n+1}-\sqrt{n-1}=\frac{(n+1)-(n-1)}{\sqrt{n+1}+\sqrt{n-1}}=\frac{2}{\sqrt{n+1}+\sqrt{n-1}}\sim\frac{1}{\sqrt n} ,$$
（有理化是处理根式差的固定动作）。于是
$$|u_n|\leqslant\frac{\sqrt{n+1}-\sqrt{n-1}}{n}\sim\frac{1}{n^{3/2}} ,$$
用到 $|\sin(n+k)|\leqslant1$。而 $\sum\dfrac{1}{n^{3/2}}$ 是 $p=\frac32>1$ 的收敛 $p$ 级数，由比较判别法，原级数**绝对收敛**。

一旦绝对收敛，$\sin(n+k)$ 的具体取值（以及 $k$ 是多少）就完全无关紧要了——这正是选项 D 的陷阱所在。

结论：只要通项衰减得足够快（比 $\frac1n$ 快），振荡因子就不影响收敛性。

@解答
先有理化：
$$\sqrt{n+1}-\sqrt{n-1}=\frac{2}{\sqrt{n+1}+\sqrt{n-1}} .$$
于是通项的绝对值
$$|u_n|=\frac{\sqrt{n+1}-\sqrt{n-1}}{n}|\sin(n+k)|\leqslant\frac{2}{n(\sqrt{n+1}+\sqrt{n-1})} .$$
当 $n\to\infty$ 时
$$\frac{2}{n(\sqrt{n+1}+\sqrt{n-1})}\sim\frac{2}{n\cdot2\sqrt n}=\frac{1}{n^{3/2}} ,$$
而 $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^{3/2}}$ 收敛（$p=\dfrac32>1$）。由正项级数的比较判别法，$\sum|u_n|$ 收敛，即原级数**绝对收敛**，且与 $k$ 无关。

选 **A**。

@考点
根式差的有理化；$p$ 级数的收敛条件；绝对收敛的判别（比较判别法）；有界因子不影响绝对收敛性。

易混：绝对收敛 $\Rightarrow$ 收敛；判断时应先试绝对收敛（最简单），不行再考虑条件收敛的各种判别法。

@易错
1. 被 $\sin(n+k)$ 迷惑，去用狄利克雷或阿贝尔判别法（可行但复杂），甚至认为与 $k$ 有关。
2. 不有理化，把 $\sqrt{n+1}-\sqrt{n-1}$ 的阶估成 $O(1)$。
3. 把 $\frac{1}{n^{3/2}}$ 误判为发散。

[49]
@题目
设
$$P(x,y)=\frac{x(\sqrt{x^2+y^2})^{k}}{y},\qquad Q(x,y)=-\frac{x^2(\sqrt{x^2+y^2})^{k}}{y^2}$$
$D=\{(x,y)\mid y>0\}$．
（Ⅱ）在 $D$ 内求函数 $u(x,y)$，使得 $du=P\,dx+Q\,dy$，并计算
$$I=\int_{(1,1)}^{(2,2)}P\,dx+Q\,dy$$

@切入点
题目要求"求 $u$ 使 $du=P dx+Q dy$"，即 $P dx+Q dy$ 是**全微分**。所以第一步必然是用
$$\frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x}$$
去**确定参数 $k$**——这是本题第一小问（已略）的内容，也是后续一切的前提。

计算时把 $r=\sqrt{x^{2}+y^{2}}$ 记住，注意 $\dfrac{\partial r}{\partial x}=\dfrac xr$、$\dfrac{\partial r}{\partial y}=\dfrac yr$。比较两端后会得到关于 $k$ 的方程，解出 $k=-1$。

有了 $k=-1$：
$$P=\frac{x}{y\sqrt{x^{2}+y^{2}}},  Q=-\frac{x^{2}}{y^{2}\sqrt{x^{2}+y^{2}}} .$$
求势函数：对 $P$ 关于 $x$ 积分，注意
$$\int\frac{x}{y\sqrt{x^{2}+y^{2}}}dx=\frac{\sqrt{x^{2}+y^{2}}}{y}+\varphi(y) ,$$
再用 $u_y=Q$ 定出 $\varphi'=0$。

最后算 $I$ 时有个漂亮的收尾：两个端点 $(1,1)$ 与 $(2,2)$ 都在直线 $y=x$ 上，而 $u=\dfrac{\sqrt{x^{2}+y^{2}}}{y}$ 在 $y=x>0$ 上恒等于 $\sqrt2$，故 $I=0$。留意这种"势函数在两端取相同值"的设计。

@解答
记 $r=\sqrt{x^{2}+y^{2}}$。由 $P dx+Q dy$ 为全微分的条件 $\dfrac{\partial P}{\partial y}=\dfrac{\partial Q}{\partial x}$，计算
$$\frac{\partial P}{\partial y}=x(\frac{kr^{k-2}\cdot y}{y}-\frac{r^{k}}{y^{2}})\cdot\frac{1}{1}=kxr^{k-2}-\frac{xr^{k}}{y^{2}} ,$$
$$\frac{\partial Q}{\partial x}=-\frac{1}{y^{2}}(2xr^{k}+kx^{3}r^{k-2}) .$$
令二者相等并约去 $x$、整理（用 $x^{2}+y^{2}=r^{2}$）得
$$k\frac{r^{k}}{y^{2}}=-\frac{r^{k}}{y^{2}}\Longrightarrow k=-1 .$$

于是
$$P=\frac{x}{y\sqrt{x^{2}+y^{2}}},  Q=-\frac{x^{2}}{y^{2}\sqrt{x^{2}+y^{2}}} .$$
由 $u_x=P$ 积分：
$$u(x,y)=\int\frac{x}{y\sqrt{x^{2}+y^{2}}}dx=\frac{\sqrt{x^{2}+y^{2}}}{y}+\varphi(y) .$$
再由
$$u_y=\frac{\frac{y^{2}}{\sqrt{x^{2}+y^{2}}}-\sqrt{x^{2}+y^{2}}}{y^{2}}+\varphi'(y)=-\frac{x^{2}}{y^{2}\sqrt{x^{2}+y^{2}}}+\varphi'(y)=Q$$
得 $\varphi'(y)=0$。故（取 $\varphi\equiv0$）
$$u(x,y)=\frac{\sqrt{x^{2}+y^{2}}}{y} (y>0) .$$

因积分与路径无关，
$$I=u(2,2)-u(1,1)=\frac{2\sqrt2}{2}-\frac{\sqrt2}{1}=\sqrt2-\sqrt2=0 .$$

@考点
全微分的判别条件 $\frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x}$；由该条件确定待定参数；势函数的求法；曲线积分等于势函数的增量。

易混：$D=\{y>0\}$ 是单连通区域，所以 $\frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x}$ 才能保证全微分存在；若区域有洞，这个条件只是必要的。

@易错
1. 求偏导时忘记 $r$ 也含 $x,y$，漏掉链式项。
2. 求势函数时把 $\varphi(y)$ 写成常数。
3. 计算 $u(2,2)$ 时把 $\sqrt{8}$ 化简出错。
4. 未注意两端点都在 $y=x$ 上，多绕弯路。

[50]
@题目
设有方程组
$$① \begin{cases} x_{1} + x_{2} = 0, \\ x_{2} - x_{4} = 0 \end{cases} \qquad ② \begin{cases} x_{1} - x_{2} + x_{3} = 0, \\ x_{2} - x_{3} + x_{4} = 0 \end{cases}$$
求：（Ⅰ）方程组 ① 与 ② 的基础解系；（Ⅱ）方程组 ① 与 ② 的非零公共解.

@切入点
（Ⅰ）两个方程组都是齐次的，直接解即可。关键是**数清自由变量的个数**：每个方程组有 $4$ 个未知数、$2$ 个独立方程，故 $\mathrm r=2$，基础解系含 $4-2=2$ 个向量。解的时候把两个"主变量"用两个"自由变量"表示，再让自由变量轮流取 $(1,0)$ 与 $(0,1)$。

（Ⅱ）"公共解"就是**同时满足两组方程**的解，所以把四个方程**联立**成一个新的齐次方程组来解。这是最直接也最不易错的做法。

（另一种思路是"设公共解 $=$ ① 基础解系的组合 $=$ ② 基础解系的组合"，解关于组合系数的方程组；对本题来说联立四式更快。）

联立后会发现新方程组的秩是 $3$，故公共解空间是一维的，通解形如 $k(-1,1,2,1)^{\mathrm T}$；题目要"非零"公共解，故 $k\neq0$。

@解答
（Ⅰ）**方程组 ①**：$x_1+x_2=0$，$x_2-x_4=0$，故 $x_1=-x_2$，$x_4=x_2$，自由变量为 $x_2,x_3$。
取 $(x_2,x_3)=(1,0)$ 与 $(0,1)$，得基础解系
$$\xi_1=(-1,1,0,1)^{\mathrm T},  \xi_2=(0,0,1,0)^{\mathrm T} .$$

**方程组 ②**：$x_1-x_2+x_3=0$，$x_2-x_3+x_4=0$，故 $x_1=x_2-x_3$，$x_4=x_3-x_2$，自由变量为 $x_2,x_3$。
取 $(x_2,x_3)=(1,0)$ 与 $(0,1)$，得基础解系
$$\eta_1=(1,1,0,-1)^{\mathrm T},  \eta_2=(-1,0,1,1)^{\mathrm T} .$$

（Ⅱ）公共解即联立四个方程的解：
$$\begin{cases}x_1+x_2=0,\\ x_2-x_4=0,\\ x_1-x_2+x_3=0,\\ x_2-x_3+x_4=0 .\end{cases}$$
由前两式 $x_1=-x_2$，$x_4=x_2$；代入第三式得 $-x_2-x_2+x_3=0$，即 $x_3=2x_2$；代入第四式 $x_2-2x_2+x_2=0$ 自动成立。故解为
$$X=x_2(-1,1,2,1)^{\mathrm T} .$$
所求非零公共解为
$$X=k(-1,1,2,1)^{\mathrm T},  k\neq0 .$$

@考点
齐次线性方程组基础解系的求法（自由变量个数 $=n-\mathrm r$）；两个方程组的公共解等于联立方程组的解；解空间的维数。

易混：公共解空间是两个解空间的**交**，其维数一般小于各自的维数；本题两个二维解空间交出一维。

@易错
1. 基础解系个数算成 $4-4=0$ 或 $2$ 个方程就写 $2$ 个（应是 $n-\mathrm r=4-2=2$，恰好也是 $2$，但理由要对）。
2. 自由变量选取不当导致解不独立。
3. 求公共解时只解一个方程组然后"目测"。
4. 忘记"非零"要求，写成 $k$ 为任意常数。

[51]
@题目
设 $D=\{(x,y)\mid0\leqslant x\leqslant a,0\leqslant y\leqslant a\}$，向 $D$ 上均匀地投掷随机点，$(X,Y)$ 表示随机点的坐标，$0<b<a$，则 $P\{|X-Y|\leqslant b\}-P\{\min(X,Y)\leqslant b\}=$ ______.

@切入点
均匀分布下"概率 $=$ 面积之比"，所以两个概率都归结为**算面积**。而两个事件的**补集**都比本身简单，这是本题最省力的地方：

- $\{|X-Y|\leqslant b\}$ 的补集是 $\{|X-Y|>b\}$，它在正方形里是**两个直角三角形**（分别在直线 $y=x\pm b$ 的外侧），每个的直角边长都是 $a-b$，面积 $\dfrac{(a-b)^{2}}{2}$，合计 $(a-b)^{2}$。
- $\{\min(X,Y)\leqslant b\}$ 的补集是 $\{\min(X,Y)>b\}=\{X>b\}\cap\{Y>b\}$，它是一个**边长为 $a-b$ 的正方形**，面积 $(a-b)^{2}$。

两个补集的面积**恰好相等**（都是 $(a-b)^{2}$），因此两个概率相等，差为 $0$。这是一个很漂亮的巧合，看出它就不必分别算出两个概率。

@解答
$(X,Y)$ 在正方形 $D=[0,a]\times[0,a]$（面积 $a^{2}$）上均匀分布，故概率等于相应区域的面积除以 $a^{2}$。

**事件一**：$\{|X-Y|>b\}$ 由两个直角三角形组成（$y<x-b$ 与 $y>x+b$ 各一个），每个的两直角边长为 $a-b$，面积 $\dfrac{(a-b)^{2}}{2}$，合计 $(a-b)^{2}$。故
$$P\{|X-Y|\leqslant b\}=1-\frac{(a-b)^{2}}{a^{2}} .$$

**事件二**：$\{\min(X,Y)>b\}=\{X>b,\ Y>b\}$ 是边长为 $a-b$ 的正方形，面积 $(a-b)^{2}$。故
$$P\{\min(X,Y)\leqslant b\}=1-\frac{(a-b)^{2}}{a^{2}} .$$

两者相等，所以
$$P\{|X-Y|\leqslant b\}-P\{\min(X,Y)\leqslant b\}=0 .$$

@考点
二维均匀分布的几何概型（概率 $=$ 面积比）；用补事件简化面积计算；$\{\min>b\}=\{X>b\}\cap\{Y>b\}$。

易混：$\{\min(X,Y)\leqslant b\}=\{X\leqslant b\}\cup\{Y\leqslant b\}$，直接算要用容斥；取补集后变成交集，简单得多。

@易错
1. 直接算 $\{|X-Y|\leqslant b\}$ 的区域（是一个六边形，麻烦）。
2. 三角形的直角边算成 $a$ 或 $b$。
3. 忘记除以总面积 $a^{2}$。
4. $\{\min\leqslant b\}$ 用成 $\{X\leqslant b\}\cap\{Y\leqslant b\}$（那是 $\max\leqslant b$）。

[52]
@题目
下列选项中（$C$ 为任意常数）是微分方程
$$\frac{dy}{dx} + \frac{x}{y} = 0$$
的通解的是（　　）.
A. $x^2 + y^2 = C^2$　　B. $x^2 - y^2 = C^2$　　C. $x^2 + y^2 = C$　　D. $x^2 - y^2 = C$

@切入点
方程 $\dfrac{dy}{dx}+\dfrac xy=0$ 即 $\dfrac{dy}{dx}=-\dfrac xy$，是最典型的**可分离变量**方程：
$$y dy=-x dx .$$
两边积分：
$$\frac{y^{2}}{2}=-\frac{x^{2}}{2}+C_1\Longrightarrow x^{2}+y^{2}=C (C=2C_1) .$$
解曲线是以原点为心的同心圆族。

四个选项的差别只在**符号**与**常数的写法**上：
- B、D 的 $x^{2}-y^{2}$ 对应的是 $y dy=x dx$，即 $\frac{dy}{dx}=\frac xy$，符号反了，直接排除；
- A 与 C 的区别只是把任意常数写成 $C^{2}$ 还是 $C$。直接积分得到的标准形式是 $x^{2}+y^{2}=C$，故选 C。

检验答案的快捷办法：把选项隐函数求导。对 $x^{2}+y^{2}=C$ 求导得 $2x+2yy'=0$，即 $y'=-\frac xy$，与方程一致；对 $x^{2}-y^{2}=C$ 求导得 $y'=\frac xy$，不符。**隐式通解用求导来验证**，比正着解更快更保险。

@解答
方程即
$$\frac{dy}{dx}=-\frac xy ,$$
分离变量
$$y dy=-x dx ,$$
两边积分
$$\frac{y^{2}}{2}=-\frac{x^{2}}{2}+C_1\Longrightarrow x^{2}+y^{2}=C (C=2C_1>0) .$$

验证：对 $x^{2}+y^{2}=C$ 两边求导得 $2x+2yy'=0$，即 $y'+\dfrac xy=0$，与原方程一致；而对 $x^{2}-y^{2}=C$ 求导得 $y'=\dfrac xy$，不符。

故选 **C**。（A 中 $x^{2}+y^{2}=C^{2}$ 描述的是同一族曲线，但通解的标准写法是把任意常数直接记为 $C$。）

@考点
可分离变量方程的解法；隐式通解的验证方法（两边求导）；任意常数的规范写法。

易混：$x^{2}+y^{2}=C$ 要求 $C>0$ 才是实曲线；$C=0$ 退化为一点，不是解曲线。

@易错
1. 符号弄反，选 B 或 D。
2. 分离变量时把 $\frac xy$ 移项出错。
3. 积分后忘记乘 $2$ 合并常数（不影响结论，但形式要规范）。

[53]
@题目
设函数 $f(x)$ 在 $(-\infty,+\infty)$ 内连续，$f''(x)$ 的图形如图所示（图略），则曲线 $y=f(x)$ 的拐点个数为 ______.

@切入点
拐点的判定要抓住一句话：**拐点是 $f''$ 变号的点**（对应曲线凹凸性改变），而不是 $f''=0$ 的点。所以看 $f''$ 的图形时，要数的是它**穿过 $x$ 轴**（由正变负或由负变正）的次数，具体要点有三条：

1. $f''(x_0)=0$ **但不变号**（图形与 $x$ 轴相切而不穿过）的点**不是**拐点；
2. $f''$ 在某点**不存在**（图形在该处断开），但左右两侧 $f''$ 异号、且 $f$ 在该点**连续**，这个点**是**拐点；
3. 拐点是曲线上的点，其横坐标必须在 $f$ 的定义域内（本题 $f$ 在 $(-\infty,+\infty)$ 上连续，故无此顾虑）。

所以正确做法是：在 $f''$ 的图上，逐个找出"符号发生改变"的横坐标，个数即为拐点个数。

**本题需要原书的图**：摘录中图形缺失，无法给出具体数字，请对照原书按上述方法数出 $f''$ 变号的点数。

@解答
拐点的判定：设 $f$ 连续，若 $f''$ 在 $x_0$ 两侧**异号**，则 $(x_0,f(x_0))$ 是曲线 $y=f(x)$ 的拐点；这里 $f''(x_0)$ 可以等于 $0$，也可以不存在。

因此，由 $f''$ 的图形数拐点个数的方法是：

1. 找出 $f''$ 的所有零点与间断点；
2. 逐个判断 $f''$ 在该点两侧的符号是否改变；
3. 只有**符号改变**的点才对应拐点；$f''=0$ 但不变号（图形与 $x$ 轴相切）的点不是拐点；
4. 由于题设 $f$ 在 $(-\infty,+\infty)$ 上连续，$f''$ 不存在的变号点同样给出拐点。

**注**：原始摘录中 $f''$ 的图形缺失，无法确定具体个数，请对照原书按上述标准数出 $f''$ 变号点的个数。

@考点
拐点的定义与判定（$f''$ 变号）；$f''=0$ 与拐点的关系（既不充分也不必要）；由导函数图形读取原函数性态。

易混：$f''(x_0)=0$ 既不是拐点的充分条件（如 $y=x^{4}$ 在 $0$ 处），也不是必要条件（如 $y=x^{1/3}$ 在 $0$ 处 $f''$ 不存在却是拐点）；唯一的标准是**变号**。

@易错
1. 把 $f''$ 的零点个数当成拐点个数。
2. 把 $f''$ 图形与 $x$ 轴相切的点也算进去。
3. 漏掉 $f''$ 不存在但变号的点。
4. 误把 $f'$ 的图形当成 $f''$ 的图形来读。

[54]
@题目
积分
$$I=\int_{0}^{1}\mathrm{d}x\int_{0}^{1-x}\mathrm{d}z\int_{0}^{1-x-z}(1-y)\mathrm{e}^{-(1-y-z)^{2}}\mathrm{d}y=\underline{\qquad}$$

@切入点
先把三重积分的**区域**看清楚：由
$$0\leqslant x\leqslant1,  0\leqslant z\leqslant1-x,  0\leqslant y\leqslant1-x-z$$
可知区域就是第一卦限内的四面体 $x,y,z\geqslant0$，$x+y+z\leqslant1$。

再看被积函数：$(1-y)\mathrm e^{-(1-y-z)^{2}}$ **完全不含 $x$**！所以最省事的是**先对 $x$ 积分**——它只贡献一个因子（$x$ 的长度）$1-y-z$。这一步把三重积分降成二重积分，是本题的第一个关键。

降维后
$$I=\iint_{y,z\geqslant0,\ y+z\leqslant1}(1-y)(1-y-z)\mathrm e^{-(1-y-z)^{2}}dydz .$$
第二个关键是注意到 $\mathrm e^{-u^{2}}$ 没有初等原函数，但 $u\mathrm e^{-u^{2}}$ 有——而括号外恰好配了一个 $(1-y-z)$！所以固定 $y$、令 $u=1-y-z$ 对 $z$ 积分，正好是 $\int u\mathrm e^{-u^{2}}du$，可以凑微分。

最后一步对 $y$ 积分时再令 $s=1-y$，又是 $\int s\mathrm e^{-s^{2}}ds$ 型。整道题就是三次"凑微分"的接力。

@解答
积分区域为四面体 $\Omega:x,y,z\geqslant0$，$x+y+z\leqslant1$。因被积函数不含 $x$，先对 $x$ 积分（$0\leqslant x\leqslant1-y-z$）：
$$I=\iint_{\substack{y,z\geqslant0\\ y+z\leqslant1}}(1-y)(1-y-z)\mathrm e^{-(1-y-z)^{2}}dydz .$$
固定 $y$，令 $u=1-y-z$（$z:0\to1-y$ 对应 $u:1-y\to0$，$du=-dz$）：
$$\int_{0}^{1-y}(1-y-z)\mathrm e^{-(1-y-z)^{2}}dz=\int_{0}^{1-y}u\mathrm e^{-u^{2}}du=\frac{1-\mathrm e^{-(1-y)^{2}}}{2} .$$
故
$$I=\int_{0}^{1}(1-y)\cdot\frac{1-\mathrm e^{-(1-y)^{2}}}{2}dy .$$
再令 $s=1-y$：
$$I=\frac12\int_{0}^{1}s(1-\mathrm e^{-s^{2}})ds=\frac12[\frac{s^{2}}{2}|_{0}^{1}-\int_{0}^{1}s\mathrm e^{-s^{2}}ds]=\frac12[\frac12-\frac{1-\mathrm e^{-1}}{2}]=\frac{\mathrm e^{-1}}{4} ,$$
即
$$I=\frac{1}{4\mathrm e} .$$

@考点
三重积分的区域识别与积分次序选择（被积函数不含某变量时先对它积分）；凑微分 $u\mathrm e^{-u^{2}}du=-\frac12d(\mathrm e^{-u^{2}})$；识别 $\mathrm e^{-u^{2}}$ 无初等原函数而 $u\mathrm e^{-u^{2}}$ 有。

易混：$\int\mathrm e^{-u^{2}}du$ 不可初等表示，但 $\int u\mathrm e^{-u^{2}}du$ 可以——差别只在多了一个因子 $u$；本题的设计正是让这个因子由"对 $x$ 积分"提供。

@易错
1. 不换积分次序，按原次序对 $y$ 先积，撞上 $\mathrm e^{-(1-y-z)^{2}}$ 积不出来。
2. 换元 $u=1-y-z$ 时上下限没反号。
3. 最后一步忘记再换元 $s=1-y$。
4. 区域写错，漏掉 $x+y+z\leqslant1$。

[55]
@题目
设 $(X,Y) \sim N(\mu_1,\mu_2;\sigma^2,\sigma^2;0)$，$X_1,X_2,\cdots,X_{n_1}\ (n_1>1)$ 和 $Y_1,Y_2,\cdots,Y_{n_2}\ (n_2>1)$ 分别为来自总体 $X$ 与 $Y$ 的简单随机样本，$\overline{X}$ 与 $\overline{Y}$ 分别为其样本均值，
$$T = \frac{1}{n_1+n_2-2}\Big[\sum_{i=1}^{n_1}(X_i - \overline{X})^2 + \sum_{j=1}^{n_2}(Y_j - \overline{Y})^2\Big]$$
则方差 $D(T) = \underline{\qquad\qquad}$。

@切入点
$T$ 的形状是"两个样本的离差平方和之和除以 $n_1+n_2-2$"，这正是两样本 $t$ 检验里的**合并样本方差** $S_w^{2}$。求它的方差，标准路线是**把它化成卡方分布的倍数**，因为卡方的方差是现成的（$D\chi^{2}(m)=2m$）。

三步：
1. 对每个样本用抽样分布定理：
$$\frac{1}{\sigma^{2}}\sum_{i=1}^{n_1}(X_i-\overline X)^{2}\sim\chi^{2}(n_1-1),  \frac{1}{\sigma^{2}}\sum_{j=1}^{n_2}(Y_j-\overline Y)^{2}\sim\chi^{2}(n_2-1) .$$
2. 两者**相互独立**（因为 $\rho=0$ 使 $X,Y$ 独立，两组样本独立），而独立卡方之和仍是卡方，自由度相加：
$$\frac{(n_1+n_2-2)T}{\sigma^{2}}\sim\chi^{2}(n_1+n_2-2) .$$
3. 于是 $T=\dfrac{\sigma^{2}}{n_1+n_2-2}\chi^{2}(n_1+n_2-2)$，用 $D(cW)=c^{2}DW$：
$$D(T)=\frac{\sigma^{4}}{(n_1+n_2-2)^{2}}\cdot2(n_1+n_2-2)=\frac{2\sigma^{4}}{n_1+n_2-2} .$$

注意题目特意让两个总体**方差相同**（都是 $\sigma^{2}$），否则两个卡方的"单位"不同，不能直接相加。

@解答
因 $(X,Y)\sim N(\mu_1,\mu_2;\sigma^{2},\sigma^{2};0)$，$\rho=0$ 故 $X$ 与 $Y$ 相互独立，两组样本相互独立，且两个总体方差都是 $\sigma^{2}$。

由正态总体的抽样分布定理，
$$\frac{1}{\sigma^{2}}\sum_{i=1}^{n_1}(X_i-\overline X)^{2}\sim\chi^{2}(n_1-1), 
\frac{1}{\sigma^{2}}\sum_{j=1}^{n_2}(Y_j-\overline Y)^{2}\sim\chi^{2}(n_2-1) ,$$
且二者独立。由卡方分布的可加性，
$$\frac{(n_1+n_2-2)T}{\sigma^{2}}=\frac{1}{\sigma^{2}}[\sum_{i=1}^{n_1}(X_i-\overline X)^{2}+\sum_{j=1}^{n_2}(Y_j-\overline Y)^{2}]\sim\chi^{2}(n_1+n_2-2) .$$
故
$$T=\frac{\sigma^{2}}{n_1+n_2-2}\cdot\chi^{2}(n_1+n_2-2) ,$$
$$D(T)=(\frac{\sigma^{2}}{n_1+n_2-2})^{2}\cdot2(n_1+n_2-2)=\frac{2\sigma^{4}}{n_1+n_2-2} .$$

@考点
正态总体的抽样分布 $\frac{(n-1)S^{2}}{\sigma^{2}}\sim\chi^{2}(n-1)$；独立卡方分布的可加性（自由度相加）；$E\chi^{2}(m)=m$、$D\chi^{2}(m)=2m$；$D(cW)=c^{2}DW$。

易混：$T$ 是合并方差 $S_w^{2}$，自由度是 $n_1+n_2-2$（两个样本各损失一个自由度），不是 $n_1+n_2-1$ 或 $n_1+n_2$。

@易错
1. 自由度写错。
2. 忘记平方常数因子（$D(cW)=c^{2}DW$）。
3. 忽略两个总体方差相等这一前提就相加。
4. 把 $D\chi^{2}(m)$ 记成 $m$。

[56]
@题目
设曲线 $L$ 为 $x^2+y^2=1$，取逆时针方向，$f(x,y)>0$，$f(x,-y)=f(x,y)$，$L_1,L_2,L_3$ 如图所示（图略），记
$$I_1=\int_{L_1}f(x,y)\,dx,\quad I_2=\int_{L_2}f(x,y)\,ds,\quad I_3=\int_{L_3}f(x,y)\,dx$$
则（　）．A. $I_1>I_2>I_3$　B. $I_2>I_3>I_1$　C. $I_3>I_2>I_1$　D. $I_2>I_1>I_3$

@切入点
这道题需要原书的图才能确定 $L_1,L_2,L_3$ 具体是哪几段弧，但**比较三个积分大小的方法**是通用的，值得掌握：

1. **先分清积分类型**：$I_1,I_3$ 是第二类（对坐标 $dx$），有方向、可正可负；$I_2$ 是第一类（对弧长 $ds$），$ds>0$ 且 $f>0$，故 $I_2>0$ 必然为正。这一条常常直接排除若干选项。
2. **用对称性把第二类积分配对**：条件 $f(x,-y)=f(x,y)$ 说明 $f$ 关于 $x$ 轴对称。若 $L_1$ 是上半圆（从 $(1,0)$ 到 $(-1,0)$）、$L_3$ 是下半圆（从 $(-1,0)$ 到 $(1,0)$），把 $L_3$ 关于 $x$ 轴反射就得到 $L_1$ 的反向弧，而 $dx$ 在反射下不变、方向相反，于是
$$I_3=-I_1 .$$
又在上半圆上 $x$ 从 $1$ 减到 $-1$，$dx<0$，$f>0$，故 $I_1<0<I_3$。
3. **第一类与第二类比较**：$|dx|\leqslant ds$ 且 $f>0$，故 $|I_3|\leqslant I_2$（若 $L_2$ 至少包含 $L_3$），得 $I_2>I_3$。

三条合起来给出 $I_2>I_3>I_1$。

**题干说明**：原始摘录中图 9-1 缺失，上述判断基于最常见的图形（$L_1$ 上半圆、$L_3$ 下半圆、$L_2$ 为整圆或上半圆），结论为 B，请对照原书的图核对。

@解答
（依据最常见的图形约定，$L_1$ 为上半圆自 $(1,0)$ 到 $(-1,0)$，$L_3$ 为下半圆自 $(-1,0)$ 到 $(1,0)$，$L_2$ 为对弧长积分的弧段。）

**$I_2>0$**：$I_2=\displaystyle\int_{L_2}f ds$ 是第一类曲线积分，$ds>0$ 且 $f>0$，故 $I_2>0$。

**$I_1$ 与 $I_3$ 的关系**：作变换 $(x,y)\mapsto(x,-y)$，它把 $L_3$ 映为与 $L_1$ 反向的弧，且 $f(x,-y)=f(x,y)$、$dx$ 不变，故
$$I_3=-I_1 .$$
在 $L_1$（上半圆，$x$ 由 $1$ 减到 $-1$）上 $dx<0$ 而 $f>0$，故 $I_1<0$，从而 $I_3=-I_1>0$。

**$I_2$ 与 $I_3$ 的关系**：由 $|dx|\leqslant ds$ 及 $f>0$，
$$I_3=\int_{L_3}f dx\leqslant\int_{L_3}f |dx|\leqslant\int_{L_3}f ds\leqslant I_2 ,$$
且不等号严格（弧上 $|dx|<ds$ 除有限点外成立）。

综上
$$I_2>I_3>0>I_1 ,$$
选 **B**。（原始摘录无图，结论依赖上述图形约定，请核对原书。）

@考点
第一类与第二类曲线积分的区别（是否有方向、被积微元的符号）；利用对称性 $f(x,-y)=f(x,y)$ 比较两段对称弧上的积分；不等式 $|dx|\leqslant ds$。

易混：第一类积分中 $ds>0$，被积函数为正时积分必为正；第二类积分的符号由方向决定，可正可负——这是排序题最先要用的判据。

@易错
1. 不区分两类积分，把 $I_2$ 也当成可能为负。
2. 对称变换后忘记方向也随之反向。
3. 直接比较 $|I_1|$ 与 $|I_3|$ 而忽略符号。

[57]
@题目
设 $\alpha, \beta, \gamma$ 均为 3 维列向量，$A = (\alpha, \beta, \gamma)$，$|A| = 1$，$B = (\alpha+\beta,\ \beta+\gamma,\ \beta+2\gamma)$，则 $|(A^{-1}+B^{-1})^{*}| = \underline{\hspace{2cm}}$.

@切入点
直接求 $A^{-1}$、$B^{-1}$ 是没法做的（$\alpha,\beta,\gamma$ 的分量未知），所以必须走**代数化简**。

第一步把 $B$ 与 $A$ 的关系写清楚：$B$ 的三列都是 $\alpha,\beta,\gamma$ 的线性组合，故 $B=AM$，其中
$$M=\begin{pmatrix}1&0&0\\1&1&1\\0&1&2\end{pmatrix}$$
（第 $j$ 列是 $B$ 第 $j$ 列的组合系数）。算得 $|M|=1$。

第二步提公因子（这是本题的核心技巧）：
$$A^{-1}+B^{-1}=A^{-1}+M^{-1}A^{-1}=(E+M^{-1})A^{-1} ,$$
于是
$$|A^{-1}+B^{-1}|=|E+M^{-1}|\cdot\frac{1}{|A|}=|E+M^{-1}| ,$$
再把 $E+M^{-1}=M^{-1}(M+E)$ 提一次：
$$|E+M^{-1}|=\frac{|M+E|}{|M|}=|M+E| .$$
一路把逆矩阵消干净，只剩一个 $3$ 阶行列式。

第三步用伴随的行列式公式 $|C^{*}|=|C|^{n-1}=|C|^{2}$。

@解答
由 $B=(\alpha+\beta,\ \beta+\gamma,\ \beta+2\gamma)$，把各列用 $\alpha,\beta,\gamma$ 表示，得 $B=AM$，其中
$$M=\begin{pmatrix}1&0&0\\1&1&1\\0&1&2\end{pmatrix},  |M|=1\cdot(1\cdot2-1\cdot1)=1 .$$
因 $|A|=1\neq0$，$A$ 可逆；又 $|B|=|A||M|=1\neq0$，$B$ 可逆，且 $B^{-1}=M^{-1}A^{-1}$。于是
$$A^{-1}+B^{-1}=(E+M^{-1})A^{-1}=M^{-1}(M+E)A^{-1} ,$$
$$|A^{-1}+B^{-1}|=\frac{1}{|M|}\cdot|M+E|\cdot\frac{1}{|A|}=|M+E| .$$
而
$$M+E=\begin{pmatrix}2&0&0\\1&2&1\\0&1&3\end{pmatrix},  |M+E|=2(2\cdot3-1\cdot1)=10 .$$
故 $|A^{-1}+B^{-1}|=10$，从而
$$|(A^{-1}+B^{-1})^{*}|=|A^{-1}+B^{-1}|^{3-1}=10^{2}=100 .$$

@考点
把列组合写成 $B=AM$；矩阵和式中提取公因子（$A^{-1}+M^{-1}A^{-1}=(E+M^{-1})A^{-1}$）；$|A^{-1}|=\frac{1}{|A|}$；伴随矩阵的行列式 $|C^{*}|=|C|^{n-1}$。

易混：提公因子时要注意左右——$B^{-1}=(AM)^{-1}=M^{-1}A^{-1}$，逆的顺序要颠倒；提出的 $A^{-1}$ 在右边。

@易错
1. $(AM)^{-1}$ 写成 $A^{-1}M^{-1}$。
2. $M$ 写成转置。
3. $|C^{*}|$ 的指数写成 $n$ 或 $n-2$。
4. 试图具体求 $M^{-1}$（不必要）。

[58]
@题目
设 $A = (\alpha_{1},\alpha_{2},\alpha_{3})$，其中 $\alpha_{1} = (1,0,1)^{\mathrm{T}}$，$\alpha_{2} = (1,1,2)^{\mathrm{T}}$，$\alpha_{3} = (1,2,a)^{\mathrm{T}}$，$B = (\beta_{1},\beta_{2})$，其中 $\beta_{1} = (-1,2,1)^{\mathrm{T}}$，$\beta_{2} = (1,0,b)^{\mathrm{T}}$. 问：
（Ⅰ）$a,b$ 为何值时，$\beta_{1},\beta_{2}$ 不能同时由 $\alpha_{1},\alpha_{2},\alpha_{3}$ 线性表示？
（Ⅱ）$a,b$ 为何值时，$\beta_{1},\beta_{2}$ 可同时由 $\alpha_{1},\alpha_{2},\alpha_{3}$ 线性表示？并求表达式.

@切入点
"$\beta_1,\beta_2$ 能否由 $\alpha_1,\alpha_2,\alpha_3$ 线性表示"就是问两个方程组 $AX=\beta_1$、$AX=\beta_2$ 是否有解。而是否有解的分水岭是 $A$ 是否可逆，所以**第一步算 $|A|$**：
$$|A|=\begin{vmatrix}1&1&1\\0&1&2\\1&2&a\end{vmatrix}=a-3 .$$

于是分两种情形：

- **$a\neq3$**：$A$ 可逆，任何向量都能唯一表示，两个 $\beta$ 都行，与 $b$ 无关。这一情形直接解方程即可。
- **$a=3$**：$\mathrm r(A)=2$（可验证 $\alpha_3=2\alpha_2-\alpha_1$），此时能否表示取决于 $\beta$ 是否落在 $\alpha_1,\alpha_2$ 张成的平面内。逐个检验：$\beta_1$ **恒能**表示（$\beta_1=-3\alpha_1+2\alpha_2$）；$\beta_2=(1,0,b)^{\mathrm T}$ 则要求 $b=1$。

所以"不能同时表示"只发生在 $a=3$ 且 $b\neq1$。这个"先看行列式、再在退化情形下逐个检验"的结构是含参线性表示问题的通法。

@解答
记 $A=(\alpha_1,\alpha_2,\alpha_3)=\begin{pmatrix}1&1&1\\0&1&2\\1&2&a\end{pmatrix}$，则
$$|A|=1\cdot(a-4)-1\cdot(0-2)+1\cdot(0-1)=a-3 .$$

**（Ⅰ）** 当 $a=3$ 时 $|A|=0$，此时 $\alpha_3=2\alpha_2-\alpha_1$，$\mathrm r(\alpha_1,\alpha_2,\alpha_3)=2$，$\alpha_1,\alpha_2$ 为极大无关组。
对 $\beta_1=(-1,2,1)^{\mathrm T}$：由 $c_1\alpha_1+c_2\alpha_2=\beta_1$ 得 $c_2=2$，$c_1=-3$，第三个分量 $-3+4=1$ 相符，故 $\beta_1$ **可以**表示。
对 $\beta_2=(1,0,b)^{\mathrm T}$：由 $c_2=0$、$c_1=1$ 得第三个分量必须为 $1$，即 $b=1$。

故当 $a=3$ 且 $b\neq1$ 时，$\beta_1,\beta_2$ **不能**同时由 $\alpha_1,\alpha_2,\alpha_3$ 线性表示。

**（Ⅱ）** 其余情形均可表示：

（i）$a\neq3$：$A$ 可逆，表示唯一。解 $AX=\beta_1$ 得
$$\beta_1=-3\alpha_1+2\alpha_2 ;$$
解 $AX=\beta_2$ 得
$$\beta_2=(1+\frac{b-1}{a-3})\alpha_1-\frac{2(b-1)}{a-3}\alpha_2+\frac{b-1}{a-3}\alpha_3 .$$

（ii）$a=3$ 且 $b=1$：$\mathrm r(A)=2$，表示不唯一。此时 $\alpha_1-2\alpha_2+\alpha_3=0$，故
$$\beta_1=-3\alpha_1+2\alpha_2,  \beta_2=\alpha_1+t(\alpha_1-2\alpha_2+\alpha_3) (t\ \text{任意}) .$$

@考点
线性表示 $\Leftrightarrow$ 方程组有解；$|A|\neq0$ 时表示唯一；退化情形下用极大无关组逐个检验；无穷多表示法的写法（特解 $+$ 相关关系的倍数）。

易混："$\beta_1,\beta_2$ 不能**同时**表示"意味着至少有一个不能表示；本题中 $\beta_1$ 永远能表示，所以问题只出在 $\beta_2$ 上。

@易错
1. 只考虑 $|A|=0$ 就断定都不能表示（$\beta_1$ 其实可以）。
2. 漏掉 $a=3,b=1$ 这个"可表示但不唯一"的情形。
3. 表达式中 $\frac{b-1}{a-3}$ 的系数算错。
4. 忘记在 $a=3$ 时给出无穷多种表示。

[59]
@题目
设函数 $f(x,y)=x+(y-1)\arcsin\sqrt{\dfrac{|x|}{y}}$，则在点 $(0,1)$ 处（　）.
A. $f'_x(0,1)=f'_y(0,1)=1$　　B. $\mathrm{d}f\big|_{(0,1)}=\mathrm{d}y$
C. $\mathrm{d}f\big|_{(0,1)}=\mathrm{d}x$　　D. $\mathrm{d}f\big|_{(0,1)}$ 不存在

@切入点
点 $(0,1)$ 处含绝对值与根号，必须**回到定义**逐项验证，顺序是：先算两个偏导数，再验可微。

**偏导数**：注意 $f(0,1)=0+0\cdot\arcsin0=0$。
- 沿 $x$ 轴方向（固定 $y=1$）：$f(x,1)=x+0=x$，故 $f'_x(0,1)=1$；
- 沿 $y$ 轴方向（固定 $x=0$）：$f(0,y)=0+(y-1)\arcsin0=0$，故 $f'_y(0,1)=0$。

**$f'_y=0$ 而不是 $1$**，这就淘汰了 A。

**可微性**：按定义验证误差
$$f(x,y)-f(0,1)-1\cdot x-0\cdot(y-1)=(y-1)\arcsin\sqrt{\frac{|x|}{y}} ,$$
除以 $\rho=\sqrt{x^{2}+(y-1)^{2}}$。这里的关键估计是 $|y-1|\leqslant\rho$，于是
$$\frac{|y-1|\arcsin\sqrt{|x|/y}}{\rho}\leqslant\arcsin\sqrt{\frac{|x|}{y}}\to0 ((x,y)\to(0,1)) ,$$
故可微，且 $df|_{(0,1)}=1\cdot dx+0\cdot dy=dx$。

这道题的教育意义在于：**含绝对值、根号的函数照样可能可微**，不能一见就断定不可微；判断必须走定义。

@解答
$f(0,1)=0+(1-1)\arcsin0=0$。

**偏导数**：
$$f(x,1)=x+0=x\Longrightarrow f'_x(0,1)=\lim_{x\to0}\frac{x-0}{x}=1 ;$$
$$f(0,y)=0+(y-1)\arcsin0=0\Longrightarrow f'_y(0,1)=\lim_{y\to1}\frac{0-0}{y-1}=0 .$$
故 A 错误（$f'_y(0,1)=0$）。

**可微性**：记 $\rho=\sqrt{x^{2}+(y-1)^{2}}$，则
$$\frac{|f(x,y)-f(0,1)-1\cdot x-0\cdot(y-1)|}{\rho}=\frac{|y-1|\arcsin\sqrt{\frac{|x|}{y}}}{\rho}\leqslant\arcsin\sqrt{\frac{|x|}{y}} ,$$
（用到 $|y-1|\leqslant\rho$）。当 $(x,y)\to(0,1)$ 时 $\dfrac{|x|}{y}\to0$，故上式趋于 $0$，即 $f$ 在 $(0,1)$ 处**可微**，且
$$df|_{(0,1)}=dx .$$
选 **C**。

@考点
分段（含绝对值）函数在一点的偏导数与可微性必须用定义验证；可微的定义（误差是 $\rho$ 的高阶无穷小）；估计中用 $|y-1|\leqslant\rho$。

易混：可微 $\Rightarrow$ 两个偏导数存在且 $df=f'_xdx+f'_ydy$；但偏导存在推不出可微，所以必须验证误差项。本题恰好可微。

@易错
1. 形式地对 $\arcsin\sqrt{|x|/y}$ 求导（在 $x=0$ 处该导数不存在），从而误判不可微。
2. $f'_y(0,1)$ 算成 $1$（把 $\arcsin$ 的值当成非零）。
3. 估计误差时忘了 $\arcsin$ 有界于 $\frac\pi2$ 还不够，需要它趋于 $0$。
4. 选 D（"不存在"）。

[60]
@题目
设 $f(x)$ 在 $(-\infty,+\infty)$ 内为连续的奇函数，$a$ 为常数，则必为偶函数的是（　）.
A. $\displaystyle\int_{a}^{x}\mathrm{d}u\int_{0}^{u}tf(t)\,\mathrm{d}t$
B. $\displaystyle\int_{a}^{x}\mathrm{d}u\int_{0}^{u}f(t)\,\mathrm{d}t$
C. $\displaystyle\int_{0}^{x}\mathrm{d}u\int_{a}^{u}f(t)\,\mathrm{d}t$
D. $\displaystyle\int_{a}^{x}\mathrm{d}u\int_{0}^{u}tf(t)\,\mathrm{d}t$

@切入点
这是"多重变限积分的奇偶性"问题，核心工具是两条规律：
$$g\ \text{为奇函数}\Longrightarrow\int_0^xg\ \text{为偶函数};  g\ \text{为偶函数}\Longrightarrow\int_0^xg\ \text{为奇函数} .$$
即**从 $0$ 开始的变限积分把奇偶性反转一次**。注意"从 $0$ 开始"是前提，下限换成别的常数 $a$ 就会差一个常数。

本题 $f$ 是奇函数，先算内层：
- $\displaystyle\int_0^uf(t)dt$：$f$ 奇 $\Rightarrow$ 它是**偶**函数，记作 $g(u)$；
- $\displaystyle\int_0^utf(t)dt$：$tf(t)$ 是奇 $\times$ 奇 $=$ **偶**函数 $\Rightarrow$ 它是**奇**函数，记作 $h(u)$。

再算外层，注意下限是 $a$ 而不是 $0$：
$$\int_a^x\varphi(u)du=\Phi(x)-\Phi(a),  \Phi(x)=\int_0^x\varphi .$$
- 取 $\varphi=h$（奇）：$\Phi$ 为**偶**，减去常数 $\Phi(a)$ 后**仍为偶**——因为偶函数减常数还是偶函数。
- 取 $\varphi=g$（偶）：$\Phi$ 为**奇**，减去常数后一般**既非奇也非偶**。

所以只有含 $tf(t)$ 的那一项是偶函数。C 选项的外层下限是 $0$、内层下限是 $a$，展开是 $\Phi(x)-g(a)x$，仍是奇函数。

**关键认识**：常数的加减会破坏奇函数（奇函数加非零常数不再是奇），但**不会破坏偶函数**——这正是答案落在"内层带 $t$"的那一项上的原因。

@解答
$f$ 为连续奇函数。记
$$g(u)=\int_{0}^{u}f(t)dt,  h(u)=\int_{0}^{u}tf(t)dt .$$

因 $f$ 奇，$g$ 为**偶**函数；因 $tf(t)$ 为偶函数（奇乘奇），$h$ 为**奇**函数。

对含 $tf(t)$ 的选项：记 $H(x)=\displaystyle\int_0^xh(u)du$，因 $h$ 奇，$H$ 为**偶**函数，故
$$\int_{a}^{x}h(u)du=H(x)-H(a) $$
是偶函数减常数，仍为**偶函数**。

对选项 B：$\displaystyle\int_a^xg(u)du=G(x)-G(a)$，其中 $G(x)=\int_0^xg$ 因 $g$ 偶而为**奇**函数；奇函数减去非零常数一般既非奇也非偶。

对选项 C：
$$\int_{0}^{x}[\int_{a}^{u}f(t)dt]du=\int_{0}^{x}[g(u)-g(a)]du=G(x)-g(a)x ,$$
两项都是奇函数，故它是**奇**函数。

故必为偶函数的是含 $tf(t)$ 的那一项，选 **A**。

（注：原始摘录中 A 与 D 转写结果相同，原书两项应有细节差别，请对照核对。）

@考点
变限积分的奇偶性反转规律（下限为 $0$ 时）；奇函数与偶函数乘积的奇偶性；"偶函数减常数仍为偶、奇函数减常数不再为奇"这一关键差别。

易混：$\int_a^x=\int_0^x-\int_0^a$，多出来的常数项是破坏奇偶性的唯一来源；判断时先把下限统一成 $0$ 再看常数的影响。

@易错
1. 忽略下限 $a$ 带来的常数，直接套反转规律。
2. 把 $tf(t)$ 的奇偶性判断错（奇 $\times$ 奇 $=$ 偶）。
3. 认为"奇函数减常数仍是奇函数"。
4. 只做一次反转（本题是二重积分，要反转两次）。

[61]
@题目
设随机变量 $X$ 服从参数为 1 的指数分布，$k$ 为大于零的常数，则 $P\{X\leqslant k+1\mid X>k\}=$ ______.

@切入点
这是条件概率，但指数分布有一个**特权**：**无记忆性**
$$P\{X>s+t\mid X>s\}=P\{X>t\} .$$
它的含义是"已经等了 $s$ 时间还没发生，则再等 $t$ 的概率与从头开始等 $t$ 完全一样"。

于是
$$P\{X\leqslant k+1\mid X>k\}=1-P\{X>k+1\mid X>k\}=1-P\{X>1\}=1-\mathrm e^{-1} ,$$
一步出结果，**与 $k$ 无关**（这正是题目设 $k$ 为任意正常数的用意）。

若不记得无记忆性，也可以直接用定义算，同样很快：
$$P\{X\leqslant k+1\mid X>k\}=\frac{P\{k<X\leqslant k+1\}}{P\{X>k\}}=\frac{\mathrm e^{-k}-\mathrm e^{-(k+1)}}{\mathrm e^{-k}}=1-\mathrm e^{-1} .$$
（用到参数为 $1$ 的指数分布的生存函数 $P\{X>x\}=\mathrm e^{-x}$。）

@解答
$X$ 服从参数为 $1$ 的指数分布，故 $P\{X>x\}=\mathrm e^{-x}$（$x>0$）。由条件概率定义
$$P\{X\leqslant k+1\mid X>k\}=\frac{P\{k<X\leqslant k+1\}}{P\{X>k\}}=\frac{\mathrm e^{-k}-\mathrm e^{-(k+1)}}{\mathrm e^{-k}}=1-\mathrm e^{-1} .$$

（也可直接用指数分布的无记忆性：$P\{X>k+1\mid X>k\}=P\{X>1\}=\mathrm e^{-1}$，取补即得。）

@考点
条件概率的定义；指数分布的分布函数与生存函数；指数分布的无记忆性 $P\{X>s+t\mid X>s\}=P\{X>t\}$。

易混：无记忆性是指数分布（连续型）与几何分布（离散型）独有的性质；对其他分布不成立。

@易错
1. 把事件写成 $P\{X\leqslant k+1\}$（忘了条件）。
2. 分子写成 $P\{X\leqslant k+1\}-P\{X\leqslant k\}$ 时符号或区间端点弄错（本题连续型，端点不影响）。
3. 结果中保留 $k$（应当消掉）。
4. 参数 $\lambda=1$ 与分布函数 $1-\mathrm e^{-\lambda x}$ 混用出错。

[62]
@题目
将
$$f(x) = \frac{x - 1}{3 - x}$$
在 $x = 1$ 处展开为幂级数，并求 $f^{(n)}(1)$.

@切入点
"在 $x=1$ 处展开"就换元 $t=x-1$，把它化成在 $t=0$ 处的麦克劳林展开。换元后
$$f=\frac{t}{3-(t+1)}=\frac{t}{2-t} ,$$
形式已经很规整。

接着要凑成 $\dfrac{1}{1-u}$ 的标准形：把分母的常数 $2$ **提出来**
$$\frac{t}{2-t}=\frac t2\cdot\frac{1}{1-\frac t2} ,$$
展开几何级数并把前面的 $\frac t2$ 乘进去，指标会整体平移一位（从 $n=1$ 开始），这是本题唯一需要小心的地方。

最后求 $f^{(n)}(1)$：由泰勒系数与导数的关系
$$f^{(n)}(1)=n!\cdot[(x-1)^{n}\ \text{的系数}] ,$$
读出系数即可。注意 $n=0$ 时 $f(1)=0$，与通项公式在 $n\geqslant1$ 时才一致。

@解答
令 $t=x-1$，则
$$f(x)=\frac{t}{3-(1+t)}=\frac{t}{2-t}=\frac t2\cdot\frac{1}{1-\frac t2} .$$
由 $\dfrac{1}{1-u}=\displaystyle\sum_{k=0}^{\infty}u^{k}$（$|u|<1$），取 $u=\dfrac t2$：
$$f(x)=\frac t2\sum_{k=0}^{\infty}\frac{t^{k}}{2^{k}}=\sum_{k=0}^{\infty}\frac{t^{k+1}}{2^{k+1}}=\sum_{n=1}^{\infty}\frac{(x-1)^{n}}{2^{n}} ,$$
收敛域为 $|\dfrac{x-1}{2}|<1$，即 $|x-1|<2$（$-1<x<3$）。

由 $f^{(n)}(1)=n!\cdot a_n$，其中 $a_n=\dfrac{1}{2^{n}}$（$n\geqslant1$），得
$$f^{(n)}(1)=\frac{n!}{2^{n}} (n\geqslant1) ,$$
而 $f(1)=0$。

@考点
在非零点处的幂级数展开（换元化归）；几何级数的逆用；指标平移；泰勒系数与高阶导数的关系 $f^{(n)}(x_0)=n!a_n$。

易混：提取常数时 $\dfrac{1}{2-t}=\dfrac12\cdot\dfrac{1}{1-\frac t2}$，不要写成 $\dfrac{1}{1-\frac t2}$（漏了 $\frac12$）；收敛条件由 $|\frac t2|<1$ 给出，半径是 $2$ 不是 $1$。

@易错
1. 不换元，直接在 $x=0$ 处展开。
2. 指标不平移，把 $n$ 与 $k$ 混用，系数错位。
3. 收敛域写成 $|x-1|<1$。
4. 求 $f^{(n)}(1)$ 时漏乘 $n!$。

[63]
@题目
函数 $y=\dfrac{x^{2}}{\sqrt{1-x^{2}}}$ 在 $\Big[\dfrac{1}{2},\dfrac{\sqrt{3}}{2}\Big]$ 上的平均值为 ______.

@切入点
函数在区间上的**平均值**的定义是
$$\bar y=\frac{1}{b-a}\int_{a}^{b}y dx ,$$
所以题目其实是"算一个定积分再除以区间长度"。

积分 $\displaystyle\int\frac{x^{2}}{\sqrt{1-x^{2}}}dx$ 含 $\sqrt{1-x^{2}}$，标准手法是**三角代换** $x=\sin t$：
$$\frac{x^{2}}{\sqrt{1-x^{2}}}dx=\frac{\sin^{2}t}{\cos t}\cos t dt=\sin^{2}t dt ,$$
根号被彻底消掉，剩下最基本的 $\sin^{2}t$ 积分。回代时用 $t=\arcsin x$、$\cos t=\sqrt{1-x^{2}}$，得原函数
$$\frac12(\arcsin x-x\sqrt{1-x^{2}}) .$$

代入上下限时有个便利：两个端点 $x=\frac12,\frac{\sqrt3}{2}$ 处 $x\sqrt{1-x^{2}}$ 的值**都是 $\frac{\sqrt3}{4}$**，相减抵消，只剩 $\arcsin$ 的差，计算立刻变得干净。

最后别忘了除以区间长度 $\dfrac{\sqrt3-1}{2}$ 并有理化。

@解答
平均值
$$\bar y=\frac{1}{\frac{\sqrt3}{2}-\frac12}\int_{\frac12}^{\frac{\sqrt3}{2}}\frac{x^{2}}{\sqrt{1-x^{2}}}dx .$$

令 $x=\sin t$（$t\in[\frac\pi6,\frac\pi3]$），$dx=\cos t dt$，$\sqrt{1-x^{2}}=\cos t$：
$$\int\frac{x^{2}}{\sqrt{1-x^{2}}}dx=\int\sin^{2}t dt=\frac t2-\frac{\sin2t}{4}=\frac12(t-\sin t\cos t)=\frac12(\arcsin x-x\sqrt{1-x^{2}}) .$$
在两端点处 $x\sqrt{1-x^{2}}$ 分别为 $\dfrac{\sqrt3}{2}\cdot\dfrac12=\dfrac{\sqrt3}{4}$ 与 $\dfrac12\cdot\dfrac{\sqrt3}{2}=\dfrac{\sqrt3}{4}$，相减为 $0$，故
$$\int_{\frac12}^{\frac{\sqrt3}{2}}\frac{x^{2}}{\sqrt{1-x^{2}}}dx=\frac12(\frac\pi3-\frac\pi6)=\frac{\pi}{12} .$$
区间长度为 $\dfrac{\sqrt3-1}{2}$，故
$$\bar y=\frac{\pi/12}{(\sqrt3-1)/2}=\frac{\pi}{6(\sqrt3-1)}=\frac{(\sqrt3+1)\pi}{12} .$$

@考点
函数平均值的定义 $\frac{1}{b-a}\int_a^bf$；三角代换 $x=\sin t$ 消去 $\sqrt{1-x^{2}}$；$\int\sin^{2}t dt=\frac t2-\frac{\sin2t}{4}$；分母有理化。

易混：平均值要除以**区间长度**，不是除以 $2$ 或不除；另外三角代换后积分限也要跟着换（或回代后用原限）。

@易错
1. 忘记除以区间长度。
2. 三角代换后 $\sin2t=2\sin t\cos t$ 的回代出错。
3. 没注意两端点处 $x\sqrt{1-x^{2}}$ 相等，白费力气。
4. 最后不有理化（不算错，但形式不好）。

[64]
@题目
设 $f(x)$ 满足
$$xf'(x) - f(x) = a(1 - \ln x) + x^2 \quad (x > 0,\ a \neq 0), \quad f(1) = 1 - a.$$
（Ⅰ）求 $f(x)$ 的表达式；
（Ⅱ）若方程 $f(x) = 0$ 在 $x \in (0, +\infty)$ 内有唯一实根，求 $a$ 的取值范围.

@切入点
（Ⅰ）方程 $xf'-f=\cdots$ 的左端是一个强烈的信号：
$$\frac{xf'-f}{x^{2}}=(\frac{f}{x})' .$$
所以**两边除以 $x^{2}$** 就能把左端凑成一个整体的导数，这比按一阶线性方程的通解公式去套更快（当然套公式也对）。

除完之后右端是 $\dfrac{a(1-\ln x)}{x^{2}}+1$，其中第一项还要能积出来——这里又有一个现成的导数：
$$(\frac{\ln x}{x})'=\frac{1-\ln x}{x^{2}} .$$
两个"凑导数"接连出现，正是本题的设计。

（Ⅱ）"方程 $f(x)=0$ 有唯一实根"要**分离参数**：把 $a$ 解出来
$$x^{2}+a(\ln x-x)=0\Longleftrightarrow a=\frac{x^{2}}{x-\ln x} $$
（注意 $x-\ln x>0$ 恒成立，最小值 $1$ 在 $x=1$ 处，所以除法合法）。于是问题变成"水平线 $y=a$ 与曲线 $y=\varphi(x)$ 恰有一个交点"。

研究 $\varphi$ 的单调性：求导后分子是 $x(x+1-2\ln x)$，而 $x+1-2\ln x$ 的最小值在 $x=2$ 处为 $3-2\ln2>0$，故 $\varphi'>0$，$\varphi$ 严格单调增；再算两端极限 $\varphi(0^{+})=0$、$\varphi(+\infty)=+\infty$。单调且值域为 $(0,+\infty)$，所以每个 $a>0$ 恰对应一个根。

@解答
（Ⅰ）方程两边除以 $x^{2}$（$x>0$）：
$$\frac{xf'-f}{x^{2}}=(\frac fx)'=\frac{a(1-\ln x)}{x^{2}}+1 .$$
注意 $(\dfrac{\ln x}{x})'=\dfrac{1-\ln x}{x^{2}}$，积分得
$$\frac fx=\frac{a\ln x}{x}+x+C\Longrightarrow f(x)=a\ln x+x^{2}+Cx .$$
由 $f(1)=1+C=1-a$ 得 $C=-a$，故
$$f(x)=x^{2}+a(\ln x-x) (x>0) .$$

（Ⅱ）$f(x)=0$ 即
$$x^{2}=a(x-\ln x) .$$
令 $\psi(x)=x-\ln x$，$\psi'=1-\frac1x$，故 $\psi$ 在 $x=1$ 处取最小值 $\psi(1)=1>0$，即 $x-\ln x>0$ 恒成立。于是方程等价于
$$a=\varphi(x):=\frac{x^{2}}{x-\ln x} .$$
求导：
$$\varphi'(x)=\frac{2x(x-\ln x)-x^{2}(1-\frac1x)}{(x-\ln x)^{2}}=\frac{x(x+1-2\ln x)}{(x-\ln x)^{2}} .$$
令 $g(x)=x+1-2\ln x$，$g'=1-\frac2x$，$g$ 在 $x=2$ 处取最小值 $g(2)=3-2\ln2>0$，故 $\varphi'(x)>0$，$\varphi$ 在 $(0,+\infty)$ 上严格单调增。又
$$\varphi(0^{+})=0^{+},  \varphi(+\infty)=+\infty ,$$
故 $\varphi$ 是 $(0,+\infty)$ 到 $(0,+\infty)$ 的严格增双射。因此 $a=\varphi(x)$ 有唯一实根当且仅当
$$a\in(0,+\infty) .$$

@考点
凑导数 $\frac{xf'-f}{x^{2}}=(\frac fx)'$、$\frac{1-\ln x}{x^{2}}=(\frac{\ln x}{x})'$；一阶线性微分方程；"根的个数"问题的分离参数法；用单调性与端点极限确定值域。

易混：分离参数时必须保证分母 $x-\ln x\neq0$；本题它恒正，所以变形是等价的。若分母可能变号，就要分区间讨论。

@易错
1. 不凑导数，硬套一阶线性方程公式时把 $P(x)=-\frac1x$ 的积分因子算错。
2. 漏掉 $\int\frac{1-\ln x}{x^{2}}dx=\frac{\ln x}{x}$ 这个技巧，陷入分部积分。
3. （Ⅱ）不分离参数，直接对 $f$ 讨论，参数在两处出现难以处理。
4. 判断 $\varphi'$ 的符号时没证明 $x+1-2\ln x>0$。

[65]
@题目
设二维随机变量 $(X,Y)$ 服从区域 $D=\{(x,y)\mid0\leqslant x\leqslant2,0\leqslant y\leqslant2\}$ 上的均匀分布. 求：
（Ⅰ）$Z=X+Y$ 的概率密度；（Ⅱ）$E(Z^2)$.

@切入点
（Ⅰ）$(X,Y)$ 在正方形上均匀分布 $\Leftrightarrow$ $X,Y$ **相互独立**且各自服从 $U[0,2]$（因为密度 $\frac14=\frac12\cdot\frac12$ 且支撑是矩形）。于是 $Z=X+Y$ 是两个独立均匀分布之和，用卷积：
$$f_Z(z)=\int f_X(x)f_Y(z-x)dx ,$$
被积函数非零要求 $0\leqslant x\leqslant2$ 且 $0\leqslant z-x\leqslant2$，即 $\max(0,z-2)\leqslant x\leqslant\min(2,z)$。**分段点是 $z=2$**，于是得到一个"三角形"密度（顶点在 $z=2$）。

也可以用几何法：$F_Z(z)=P\{X+Y\leqslant z\}$ 就是正方形中直线 $x+y=z$ 左下方的面积除以 $4$，求导即得密度，结论相同。

（Ⅱ）**不要**用刚求出的 $f_Z$ 去积分算 $EZ^{2}$，那是绕远路。直接展开：
$$EZ^{2}=E(X+Y)^{2}=EX^{2}+2E(XY)+EY^{2}=EX^{2}+2EX\cdot EY+EY^{2} ,$$
（独立时 $E(XY)=EX\cdot EY$）。而 $U[0,2]$ 的 $EX=1$、$DX=\frac{(2-0)^{2}}{12}=\frac13$、$EX^{2}=\frac13+1=\frac43$。三个数一加即得。

@解答
（Ⅰ）因 $(X,Y)$ 在正方形 $[0,2]^{2}$ 上均匀分布，密度为 $\dfrac14$，可分离为 $\dfrac12\cdot\dfrac12$，故 $X,Y$ 相互独立且都服从 $U[0,2]$，$f_X(x)=f_Y(x)=\dfrac12$（$0\leqslant x\leqslant2$）。

由卷积公式，被积函数非零要求 $0\leqslant x\leqslant2$ 且 $0\leqslant z-x\leqslant2$：

当 $0\leqslant z\leqslant2$ 时 $x\in[0,z]$，$f_Z(z)=\displaystyle\int_0^z\frac14dx=\frac z4$；

当 $2<z\leqslant4$ 时 $x\in[z-2,2]$，$f_Z(z)=\displaystyle\int_{z-2}^{2}\frac14dx=\frac{4-z}{4}$；

其余为 $0$。即
$$f_Z(z)=\begin{cases}\dfrac z4,&0\leqslant z\leqslant2,\\[4pt] \dfrac{4-z}{4},&2<z\leqslant4,\\[4pt] 0,&\text{其他} .\end{cases}$$

（Ⅱ）$X\sim U[0,2]$ 故 $EX=1$，$DX=\dfrac{(2-0)^{2}}{12}=\dfrac13$，$EX^{2}=DX+(EX)^{2}=\dfrac43$；$Y$ 同理。由独立性 $E(XY)=EX\cdot EY=1$，
$$E(Z^{2})=E(X+Y)^{2}=EX^{2}+2E(XY)+EY^{2}=\frac43+2+\frac43=\frac{14}{3} .$$

@考点
矩形上的均匀分布 $\Leftrightarrow$ 两分量独立且各自均匀；独立随机变量和的卷积公式；均匀分布 $U[a,b]$ 的 $E=\frac{a+b}{2}$、$D=\frac{(b-a)^{2}}{12}$；$EZ^{2}=DZ+(EZ)^{2}$ 或直接展开。

易混：求 $EZ^{2}$ 不必先求 $f_Z$；反过来若题目要 $P\{Z\leqslant z\}$ 这类概率，才必须用分布。

@易错
1. 卷积定限时漏掉 $z-2\leqslant x$ 这一半约束，把 $2<z\leqslant4$ 的那段算错。
2. $DX$ 用成 $\frac{(b-a)^{2}}{4}$ 或 $\frac{b-a}{12}$。
3. （Ⅱ）用 $f_Z$ 硬积（能做，但要分两段且易错）。
4. 忘记 $E(XY)=EX\cdot EY$ 需要独立性。

[66]
@题目
设矩阵 $A_{m \times n}, B_{n \times m}$，则（　　）.
A. 当 $m > n$ 时，$AB$ 必可逆　B. 当 $m > n$ 时，必有 $|AB| = 0$
C. 当 $n > m$ 时，必有 $\mathrm{r}(AB) < m$　D. 当 $n > m$ 时，$ABx = 0$ 必有唯一解

@切入点
四个选项都围绕 $AB$（$m$ 阶方阵）的秩与可逆性，核心工具只有一条不等式：
$$\mathrm r(AB)\leqslant\min\{\mathrm r(A),\ \mathrm r(B)\}\leqslant\min\{m,n\} .$$

**当 $m>n$ 时**：$\mathrm r(AB)\leqslant n<m$，而 $AB$ 是 $m$ 阶方阵，秩小于阶数 $\Rightarrow$ 不可逆 $\Rightarrow|AB|=0$。所以 A 错、**B 对**。这里的关键是"**中间维数 $n$ 卡住了秩**"——乘积的秩不可能超过中间那个维数。

**当 $n>m$ 时**：$\mathrm r(AB)\leqslant m$，但可以取到 $m$。反例：取 $A=(E_m\ \ O)$（$m\times n$）、$B=\begin{pmatrix}E_m\\ O\end{pmatrix}$（$n\times m$），则 $AB=E_m$，秩恰为 $m$、可逆。故 C 的"必有 $\mathrm r(AB)<m$"错误，D 的"$ABx=0$ 必有唯一解"也错（若 $AB$ 奇异就有无穷多解，"必"字不成立）。

做这类"必"字选择题，**能举一个反例就淘汰**，不必纠结。

@解答
$AB$ 是 $m$ 阶方阵，且由秩的不等式
$$\mathrm r(AB)\leqslant\min\{\mathrm r(A),\mathrm r(B)\}\leqslant\min\{m,n\} .$$

**当 $m>n$ 时**：$\mathrm r(AB)\leqslant n<m$，故 $m$ 阶方阵 $AB$ 不满秩，$|AB|=0$。所以 A 错误，**B 正确**。

**当 $n>m$ 时**：取
$$A=(E_m  O)_{m\times n},  B=\begin{pmatrix}E_m\\ O\end{pmatrix}_{n\times m} ,$$
则 $AB=E_m$，$\mathrm r(AB)=m$ 且 $AB$ 可逆。故 C（"必有 $\mathrm r(AB)<m$"）错误；此时 $ABx=0$ 只有零解，但若取 $A=O$ 则 $AB=O$，$ABx=0$ 有无穷多解，故 D（"必有唯一解"）也错误。

选 **B**。

@考点
秩的不等式 $\mathrm r(AB)\leqslant\min\{\mathrm r(A),\mathrm r(B)\}$；方阵可逆 $\Leftrightarrow$ 满秩 $\Leftrightarrow$ 行列式非零；用反例否定"必然"型命题。

易混：$\mathrm r(AB)\leqslant\min\{m,n\}$ 中的 $n$ 是**中间维数**；当中间维数小于外层维数时，乘积必定降秩，这是本题的要害。

@易错
1. 认为 $m>n$ 时 $AB$ 可能可逆（选 A）。
2. 把 $\mathrm r(AB)\leqslant\min\{m,n\}$ 记成 $\leqslant\max$。
3. C、D 中忽略"必"字，看到"可能成立"就选。
4. 分不清 $AB$ 是 $m$ 阶还是 $n$ 阶方阵。

[67]
@题目
设 $f(x,y)=x^{2}+axy+by^{2}$ 在点 $P(2,1)$ 处沿 $\boldsymbol{l}=(0,1)$ 的方向导数取得最大值 $2$.
（Ⅰ）求 $a,b$ 的值；
（Ⅱ）求原点 $O(0,0)$ 到曲线 $f(x,y)=1$ 上点的距离的最大值与最小值.

@切入点
（Ⅰ）方向导数有一条核心性质：**沿梯度方向取得最大值，最大值就是梯度的模**。题目说"沿 $\mathbf l=(0,1)$ 取得最大值 $2$"，于是这两件事同时成立：
- 梯度方向就是 $(0,1)$ 方向；
- 梯度的模是 $2$。

两条合起来直接给出
$$\nabla f(2,1)=2\cdot(0,1)=(0,2) ,$$
这是**一个向量等式**，两个分量各给一个方程，正好解出 $a,b$。看出这一点，第一问就是两行计算。

（Ⅱ）$f(x,y)=1$ 在 $a=-4,b=5$ 时是二次曲线 $x^{2}-4xy+5y^{2}=1$，即 $X^{\mathrm T}AX=1$，其中 $A=\begin{pmatrix}1&-2\\-2&5\end{pmatrix}$ 正定（故是椭圆）。要求原点到曲线上点的距离 $|X|$ 的最值，用特征值估计：
$$\lambda_{\min}|X|^{2}\leqslant X^{\mathrm T}AX\leqslant\lambda_{\max}|X|^{2} ,$$
在约束 $X^{\mathrm T}AX=1$ 下得
$$\frac{1}{\lambda_{\max}}\leqslant|X|^{2}\leqslant\frac{1}{\lambda_{\min}} ,$$
且等号在相应的特征向量方向取到。算出 $\lambda=3\pm2\sqrt2$，注意 $(3+2\sqrt2)(3-2\sqrt2)=1$，两者互为倒数，所以 $d^{2}$ 的范围恰是 $[3-2\sqrt2,3+2\sqrt2]$；又 $3\pm2\sqrt2=(\sqrt2\pm1)^{2}$，开方即得。

@解答
（Ⅰ）$\nabla f=(2x+ay,\ ax+2by)$，在 $P(2,1)$ 处
$$\nabla f(2,1)=(4+a,\ 2a+2b) .$$
方向导数沿梯度方向取得最大值，且最大值等于 $|\nabla f|$。由题设该方向为 $\mathbf l=(0,1)$、最大值为 $2$，故
$$\nabla f(2,1)=2(0,1)=(0,2) ,$$
即
$$4+a=0,  2a+2b=2\Longrightarrow a=-4,  b=5 .$$

（Ⅱ）此时 $f(x,y)=x^{2}-4xy+5y^{2}=X^{\mathrm T}AX$，其中
$$A=\begin{pmatrix}1&-2\\-2&5\end{pmatrix},  |\lambda E-A|=\lambda^{2}-6\lambda+1=0\Longrightarrow\lambda=3\pm2\sqrt2 ,$$
两个特征值都为正，故 $f=1$ 是椭圆。

对单位向量方向作估计：在约束 $X^{\mathrm T}AX=1$ 下，
$$\lambda_{\min}|X|^{2}\leqslant X^{\mathrm T}AX=1\leqslant\lambda_{\max}|X|^{2}\Longrightarrow \frac{1}{\lambda_{\max}}\leqslant|X|^{2}\leqslant\frac{1}{\lambda_{\min}} ,$$
等号分别在 $\lambda_{\max}$、$\lambda_{\min}$ 对应的特征向量方向取到。由 $(3+2\sqrt2)(3-2\sqrt2)=1$，
$$\frac{1}{\lambda_{\max}}=3-2\sqrt2=(\sqrt2-1)^{2},  \frac{1}{\lambda_{\min}}=3+2\sqrt2=(\sqrt2+1)^{2} .$$
故
$$d_{\min}=\sqrt2-1,  d_{\max}=\sqrt2+1 .$$

@考点
方向导数的最大值等于梯度的模、方向为梯度方向；二次型与对称矩阵；$X^{\mathrm T}AX$ 在给定 $|X|$ 下的取值范围由特征值控制（瑞利商）；正定二次曲线是椭圆。

易混：这里是"固定 $X^{\mathrm T}AX=1$ 求 $|X|$ 的范围"，与常见的"固定 $|X|=1$ 求 $X^{\mathrm T}AX$ 的范围"互为倒数关系；不等式方向不要弄反。

@易错
1. （Ⅰ）只用"方向为 $(0,1)$"而漏掉"最大值为 $2$"，导致方程不够。
2. 梯度算错（$f'_y=ax+2by$）。
3. （Ⅱ）把 $d^{2}$ 的范围写成 $[\lambda_{\min},\lambda_{\max}]$。
4. 忘记开方，答成 $3\pm2\sqrt2$。

[68]
@题目
设 $D=\{(x,y)\mid 0\leqslant x\leqslant 2,\ 0\leqslant y\leqslant\sqrt{2x-x^{2}}\}$，计算
$$I=\iint_{D}|x+y-2|\mathrm{d}x\mathrm{d}y.$$

@切入点
先看区域：$0\leqslant y\leqslant\sqrt{2x-x^{2}}$ 即 $y\geqslant0$ 且 $(x-1)^{2}+y^{2}\leqslant1$，是圆心 $(1,0)$、半径 $1$ 的**上半圆盘**，面积 $\dfrac\pi2$。

再看被积函数的绝对值：分界线是直线 $x+y=2$，它与半圆盘的边界交于 $(2,0)$ 和 $(1,1)$（两点都在圆上，可直接验证），确实穿过区域，所以必须分片。

分片后的处理技巧很关键。直接分别算两片要算两次；更省事的是用**恒等式**
$$|t|=-t+2t^{+} (t^{+}=\max(t,0)) ,$$
即
$$I=\iint_D(2-x-y)d\sigma+2\iint_{D_2}(x+y-2)d\sigma ,$$
其中 $D_2=D\cap\{x+y>2\}$ 只是一个小的**弓形**。这样第一个积分在整个半圆盘上算（可以用面积与形心，完全不用定限），只有第二个要真的积分，工作量减半。

第一个积分：$\displaystyle\iint_D(2-x-y)=2S-\bar xS-\bar yS$，其中 $S=\frac\pi2$，半圆盘的形心 $\bar x=1$（关于 $x=1$ 对称）、$\bar y=\frac{4R}{3\pi}=\frac{4}{3\pi}$。

第二个积分：平移 $u=x-1,v=y$ 化到以原点为心的上半单位圆，再用极坐标，内边界是直线 $u+v=1$ 即 $r=\frac{1}{\cos\theta+\sin\theta}$。

@解答
$D$ 为上半圆盘 $(x-1)^{2}+y^{2}\leqslant1$，$y\geqslant0$，面积 $S=\dfrac\pi2$。直线 $x+y=2$ 过 $(2,0)$ 与 $(1,1)$，两点都在圆周上，故它把 $D$ 分成两块。记 $D_2=D\cap\{x+y>2\}$。由
$$|x+y-2|=(2-x-y)+2(x+y-2)^{+} ,$$
得
$$I=\iint_D(2-x-y)d\sigma+2\iint_{D_2}(x+y-2)d\sigma .$$

**第一部分**：半圆盘的形心为 $\overline x=1$（对称性），$\overline y=\dfrac{4R}{3\pi}=\dfrac{4}{3\pi}$，故
$$\iint_D(2-x-y)d\sigma=2S-\overline xS-\overline yS=(2-1-\frac{4}{3\pi})\cdot\frac\pi2=\frac\pi2-\frac23 .$$

**第二部分**：令 $u=x-1$，$v=y$，则 $D$ 变为上半单位圆盘，$x+y-2=u+v-1$，$D_2$ 变为 $\{u^{2}+v^{2}\leqslant1,\ u+v>1\}$。用极坐标，记 $c=\cos\theta+\sin\theta$，则 $\theta\in[0,\frac\pi2]$，$\dfrac1c\leqslant r\leqslant1$：
$$\iint_{D_2}(u+v-1)dudv=\int_{0}^{\frac\pi2}\int_{\frac1c}^{1}(rc-1)r drd\theta=\int_{0}^{\frac\pi2}(\frac c3-\frac12+\frac{1}{6c^{2}})d\theta .$$
由
$$\int_{0}^{\frac\pi2}c d\theta=2,  \int_{0}^{\frac\pi2}\frac{d\theta}{c^{2}}=1 ,$$
得
$$\iint_{D_2}(x+y-2)d\sigma=\frac23-\frac\pi4+\frac16=\frac56-\frac\pi4 .$$

**合计**：
$$I=(\frac\pi2-\frac23)+2(\frac56-\frac\pi4)=\frac\pi2-\frac23+\frac53-\frac\pi2=1 .$$

@考点
含绝对值被积函数的二重积分（按分界线分片）；恒等式 $|t|=-t+2t^{+}$ 减少计算量；形心公式 $\iint_Dx d\sigma=\overline xS$；半圆盘的形心 $\overline y=\frac{4R}{3\pi}$；平移与极坐标联用。

易混：极坐标下直线 $u+v=1$ 的方程是 $r=\dfrac{1}{\cos\theta+\sin\theta}$，它是 $D_2$ 的**内**边界；外边界才是 $r=1$。

@易错
1. 不平移就直接对 $(x-1)^{2}+y^{2}\leqslant1$ 用极坐标（极点不在圆心，边界方程变成 $r=2\cos\theta$，也可做但更繁）。
2. 半圆盘形心记成 $\frac{4R}{3\pi}$ 以外的值，或误用整圆形心 $0$。
3. 去绝对值时符号弄反。
4. $\int_0^{\frac\pi2}\frac{d\theta}{(\cos\theta+\sin\theta)^{2}}$ 算错（可用 $c^{2}=2\sin^{2}(\theta+\frac\pi4)$ 化为 $\csc^{2}$ 的积分）。
