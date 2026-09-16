[1]
@题目
设 $E$ 是 $n$ 阶单位矩阵，则 $n$（$n$ 为偶数）阶实对称矩阵 $A$ 正定的充分必要条件是（　　）.
A. 存在 $n$ 阶矩阵 $C$，使得 $A=C^{\mathrm T}C$
B. 二次型 $X^{\mathrm T}AX$ 的负惯性指数为 $0$
C. 存在可逆矩阵 $P$，使得 $P^{-1}AP=E$
D. $A$ 的伴随矩阵 $A^{*}$ 与 $E$ 合同

@切入点
判断"正定的充要条件"，要对每个选项**双向**检查：既问"正定能否推出它"，也问"它能否推出正定"。常见的错误选项都是只满足其中一个方向。

逐条过：
- **A**：$A=C^{\mathrm T}C$ 只保证半正定（$X^{\mathrm T}AX=|CX|^{2}\geqslant0$）；要正定必须 $C$ **可逆**。题中没说 $C$ 可逆，故只必要不充分。
- **B**：负惯性指数为 $0$ 意味着没有负特征值，但**可以有零特征值**（半正定）。同样只必要不充分。
- **C**：$P^{-1}AP=E$ 推出 $A=PEP^{-1}=E$，这比正定强太多了（只有单位矩阵满足），既不充分也不必要。
- **D**：$A^{*}$ 与 $E$ 合同 $\Leftrightarrow A^{*}$ 正定。这一条要认真验双向，而且**"$n$ 为偶数"这个条件正是为它准备的**。

D 的反方向是关键：设 $A^{*}$ 正定，则 $A$ 的特征值 $\lambda_i$ 满足 $\dfrac{|A|}{\lambda_i}>0$，即所有 $\lambda_i$ 与 $|A|$ **同号**。若它们全为负，则 $|A|=\prod\lambda_i$ 是 $n$ 个负数之积；$n$ 为偶数时这个积是**正**的，与"$\lambda_i$ 和 $|A|$ 同号"矛盾。故只能全为正，$A$ 正定。

（顺带看出：若 $n$ 为奇数，取 $A=-E$ 则 $A^{*}=E$ 正定而 $A$ 负定，D 就不成立——题目特意限定 $n$ 为偶数。）

@解答
A 错误：$A=C^{\mathrm T}C$ 时 $X^{\mathrm T}AX=|CX|^{2}\geqslant0$ 只保证半正定；只有 $C$ 可逆才正定。故它是必要条件而非充分条件。

B 错误：负惯性指数为 $0$ 只说明没有负特征值，仍可能有零特征值（例如 $A=\mathrm{diag}(1,0)$），即半正定而非正定。

C 错误：由 $P^{-1}AP=E$ 得 $A=E$，条件过强，正定矩阵不必等于 $E$。

D 正确：

（必要性）设 $A$ 正定，特征值 $\lambda_1,\cdots,\lambda_n>0$，则 $|A|=\prod\lambda_i>0$，而 $A^{*}=|A|A^{-1}$ 的特征值为 $\dfrac{|A|}{\lambda_i}>0$；又 $A^{*}$ 实对称，故 $A^{*}$ 正定，从而与 $E$ 合同。

（充分性）设 $A^{*}$ 与 $E$ 合同，即 $A^{*}$ 正定，则 $A^{*}$ 的特征值 $\dfrac{|A|}{\lambda_i}>0$，故所有 $\lambda_i$ 与 $|A|$ 同号。若 $\lambda_i$ 全为负，因 $n$ 为**偶数**，$|A|=\prod\lambda_i>0$，与 $\lambda_i<0$ 同号矛盾。故 $\lambda_i$ 全为正，$A$ 正定。

选 **D**。

@考点
正定的多种等价刻画（特征值全正、顺序主子式全正、合同于 $E$、$A=C^{\mathrm T}C$ 且 $C$ 可逆）；伴随矩阵的特征值 $\frac{|A|}{\lambda}$；合同于 $E$ $\Leftrightarrow$ 正定。

易混：半正定与正定的区别（是否允许零特征值）；$A=C^{\mathrm T}C$ 中 $C$ 是否可逆决定了是半正定还是正定。

@易错
1. 选 A 或 B（忽略"可逆"或"零特征值"的漏洞）。
2. D 的充分性中忘记用"$n$ 为偶数"排除全负的情形。
3. 把"合同于 $E$"与"相似于 $E$"混淆（后者意味着矩阵就是 $E$）。

[2]
@题目
设 $y=y(x)$ 由方程 $\sqrt{x^{2}+y^{2}}=e^{\arctan\frac{y}{x}}$ 确定，求 $\dfrac{\mathrm{d}^{2}y}{\mathrm{d}x^{2}}$.

@切入点
方程 $\sqrt{x^{2}+y^{2}}=\mathrm e^{\arctan\frac yx}$ 两端一个带根号、一个带指数，直接求导会很乱。**两边取对数**可以同时消掉根号与指数：
$$\frac12\ln(x^{2}+y^{2})=\arctan\frac yx ,$$
这是处理"指数 $=$ 根式"型隐函数的标准预处理。

取完对数后两边对 $x$ 求导（$y$ 是 $x$ 的函数）：
$$\frac{x+yy'}{x^{2}+y^{2}}=\frac{xy'-y}{x^{2}+y^{2}} ,$$
（右端用了 $\arctan u$ 的导数 $\frac{u'}{1+u^{2}}$，其中 $u=\frac yx$，化简后分母恰是 $x^{2}+y^{2}$——**两端分母相同**，这是本题最舒服的一点）。约去分母立刻得
$$y'=\frac{x+y}{x-y} .$$

求二阶导时对商求导，代入 $y'$ 后分子会大幅化简：$-2y+2x\cdot\frac{x+y}{x-y}$ 通分得 $\frac{2(x^{2}+y^{2})}{x-y}$，于是
$$y''=\frac{2(x^{2}+y^{2})}{(x-y)^{3}} .$$
**记得把 $y'$ 代回**——二阶导的答案里不应再出现 $y'$。

@解答
两边取对数：
$$\frac12\ln(x^{2}+y^{2})=\arctan\frac yx .$$
两边对 $x$ 求导（$y=y(x)$）：
$$\frac12\cdot\frac{2x+2yy'}{x^{2}+y^{2}}=\frac{1}{1+\frac{y^{2}}{x^{2}}}\cdot\frac{y'x-y}{x^{2}}=\frac{xy'-y}{x^{2}+y^{2}} ,$$
即
$$x+yy'=xy'-y\Longrightarrow y'(x-y)=x+y\Longrightarrow y'=\frac{x+y}{x-y} .$$

再对 $x$ 求导：
$$y''=\frac{(1+y')(x-y)-(x+y)(1-y')}{(x-y)^{2}} .$$
分子化简：
$$(x-y)+y'(x-y)-(x+y)+y'(x+y)=-2y+2xy'=-2y+\frac{2x(x+y)}{x-y}=\frac{2(x^{2}+y^{2})}{x-y} .$$
故
$$\frac{d^{2}y}{dx^{2}}=\frac{2(x^{2}+y^{2})}{(x-y)^{3}} .$$

@考点
隐函数求导；对数求导法（同时消去根号与指数）；$(\arctan u)'=\frac{u'}{1+u^{2}}$；二阶隐函数导数必须把 $y'$ 代回消去。

易混：$\arctan\frac yx$ 对 $x$ 求导时，外层导数是 $\frac{1}{1+(y/x)^{2}}=\frac{x^{2}}{x^{2}+y^{2}}$，内层导数是 $\frac{xy'-y}{x^{2}}$，两者相乘 $x^{2}$ 恰好约掉。

@易错
1. 不取对数硬求导，$\mathrm e^{\arctan\frac yx}$ 的导数写错。
2. 求 $\arctan\frac yx$ 的导数时把内层写成 $\frac{y'}{x}$（漏掉商的求导）。
3. 二阶导中保留 $y'$ 没代回。
4. 分子化简出错（关键是 $-2y+2xy'$ 通分）。

[3]
@题目
设 $P(A)>0$，$P(B)>0$，$P(A\mid B)=P(A)$，则下列选项中不正确的是（　　）.
A. $A$ 与 $B$ 互不相容
B. $A$ 与 $B$ 相容
C. $P(B\mid A)=P(B)$
D. $P(\overline A\mid\overline B)=P(\overline A)$

@切入点
题目给的 $P(A\mid B)=P(A)$ 只有一个含义：**$A$ 与 $B$ 相互独立**。因为
$$P(A\mid B)=\frac{P(AB)}{P(B)}=P(A)\Longleftrightarrow P(AB)=P(A)P(B) .$$
所以整道题变成"由独立性能推出什么"。

独立性的直接推论：
$$P(AB)=P(A)P(B)>0 ,$$
（用到题设 $P(A)>0,P(B)>0$）。$P(AB)>0$ 说明 $AB\neq\varnothing$，即 $A$ 与 $B$ **必定相容**。于是 B 正确，而 A"互不相容"**不正确**——它正是要选的答案。

再看 C、D：独立性是对称的，故 $P(B\mid A)=P(B)$，C 正确；独立还蕴含 $\overline A$ 与 $\overline B$ 独立（四对补事件的独立性同时成立），故 D 正确。

关键认识：**"独立"与"互斥"是两个几乎相反的概念**——两个正概率事件如果互斥，就一定不独立；如果独立，就一定不互斥。本题正是考这一点。

@解答
由 $P(B)>0$，
$$P(A\mid B)=\frac{P(AB)}{P(B)}=P(A)\Longleftrightarrow P(AB)=P(A)P(B) ,$$
即 $A$ 与 $B$ 相互独立。

于是
$$P(AB)=P(A)P(B)>0 ,$$
说明 $AB\neq\varnothing$，即 $A$ 与 $B$ **相容**。故选项 A"$A$ 与 $B$ 互不相容"**不正确**，而 B 正确。

又由独立性的对称性，$P(B\mid A)=\dfrac{P(AB)}{P(A)}=P(B)$，C 正确；由 $A,B$ 独立可推出 $\overline A,\overline B$ 独立，故 $P(\overline A\mid\overline B)=P(\overline A)$，D 正确。

选 **A**。

@考点
条件概率与独立性的等价刻画 $P(A\mid B)=P(A)\Leftrightarrow P(AB)=P(A)P(B)$；独立与互斥的区别；独立性对补事件的传递（$A,B$ 独立 $\Rightarrow$ $\overline A,B$、$A,\overline B$、$\overline A,\overline B$ 均独立）。

易混：互斥（$AB=\varnothing$）是**事件集合**的关系，独立是**概率**的关系。当 $P(A)>0,P(B)>0$ 时，两者不可能同时成立。

@易错
1. 认为独立就是互斥。
2. 忘记题设 $P(A),P(B)>0$（若允许零概率，互斥与独立可以同时成立）。
3. 题目问的是"**不**正确的"，选成了正确的那个。

[4]
@题目
设光滑有向曲面 $S$ 的边界曲线为光滑有向闭曲线 $L$，方向符合右手法则，则
$$I=\oint_L \mathbf{grad}\,\sin(x+y+z)\cdot d\mathbf s=\underline{\qquad}$$

@切入点
被积的向量场是 $\mathbf{grad} \varphi$（其中 $\varphi=\sin(x+y+z)$），这是一个**梯度场**（保守场）。梯度场有一条一票否决式的性质：
$$\oint_L\mathbf{grad} \varphi\cdot d\mathbf s=0 (L\ \text{为任意闭曲线}) ,$$
因为 $\mathbf{grad} \varphi\cdot d\mathbf s=d\varphi$ 是全微分，沿闭路的增量为零。

所以答案直接是 $0$，与 $L$ 的形状、$S$ 的形状都无关。

若想从斯托克斯公式看：$I=\displaystyle\iint_S\mathbf{rot}(\mathbf{grad} \varphi)\cdot d\mathbf S$，而恒等式
$$\mathbf{rot} \mathbf{grad}\equiv\mathbf 0$$
（梯度场无旋）同样给出 $0$。题目特意交代"$S$ 的边界是 $L$、方向符合右手法则"，就是提示可以走斯托克斯这条路。

两条路都指向同一个恒等式，记住"**梯度场无旋、环流为零**"即可。

@解答
记 $\varphi(x,y,z)=\sin(x+y+z)$，则被积向量场为 $\mathbf{grad} \varphi$，且
$$\mathbf{grad} \varphi\cdot d\mathbf s=\varphi_xdx+\varphi_ydy+\varphi_zdz=d\varphi ,$$
是全微分。沿闭曲线 $L$ 积分，起点与终点重合，故
$$I=\oint_Ld\varphi=0 .$$

（也可用斯托克斯公式：$I=\displaystyle\iint_S\mathbf{rot}(\mathbf{grad} \varphi)\cdot d\mathbf S=0$，因为 $\mathbf{rot} \mathbf{grad}\equiv\mathbf0$。）

@考点
梯度、旋度的基本恒等式 $\mathbf{rot} \mathbf{grad}\equiv\mathbf0$；保守场沿闭曲线的环流为零；斯托克斯公式。

易混：另一个常用恒等式是 $\mathrm{div} \mathbf{rot}\equiv0$（旋度场无源）；两条要分清：前者说"梯度场无旋"，后者说"旋度场无源"。

@易错
1. 真的去算 $\mathbf{grad}\sin(x+y+z)=\cos(x+y+z)(1,1,1)$ 再参数化积分。
2. 忘记 $L$ 是闭曲线这个前提（对非闭曲线，积分等于 $\varphi$ 在两端的差）。
3. 把旋度与散度的恒等式记混。

[5]
@题目
求直线
$$L:\frac{x-1}{3}=\frac{y-2}{4}=\frac{z+1}{1}$$
绕直线
$$\begin{cases}x=2,\\ y=3\end{cases}$$
旋转一周所得的曲面方程.

@切入点
求旋转曲面方程，抓住旋转的两条不变量：**到轴的距离不变**、**沿轴方向的坐标不变**。

本题转轴是 $\begin{cases}x=2\\ y=3\end{cases}$，即过点 $(2,3,0)$ 且平行于 $z$ 轴的直线。于是：
- "沿轴方向的坐标"就是 $z$；
- "到轴的距离"就是 $\sqrt{(x-2)^{2}+(y-3)^{2}}$。

所以只需做一件事：把母线 $L$ 上**高度为 $z$ 的那个点**找出来，算它到轴的距离，令曲面上点到轴的距离等于它。

把 $L$ 参数化：$(1+3t,\ 2+4t,\ -1+t)$。由第三个分量 $z=-1+t$ **解出 $t=z+1$**（这一步是关键：把参数用 $z$ 表示），代回前两个分量得母线上该高度处的点
$$(3z+4,\ 4z+6,\ z) ,$$
它到轴的距离平方为 $(3z+2)^{2}+(4z+3)^{2}$。于是曲面方程为
$$(x-2)^{2}+(y-3)^{2}=(3z+2)^{2}+(4z+3)^{2} .$$

@解答
转轴 $\begin{cases}x=2\\ y=3\end{cases}$ 是过 $(2,3,0)$ 且平行于 $z$ 轴的直线。

把母线 $L$ 参数化：
$$x=1+3t,  y=2+4t,  z=-1+t .$$
由 $z=-1+t$ 得 $t=z+1$，故母线上高度为 $z$ 的点为
$$(1+3(z+1),\ 2+4(z+1),\ z)=(3z+4,\ 4z+6,\ z) ,$$
它到转轴的距离平方为
$$(3z+4-2)^{2}+(4z+6-3)^{2}=(3z+2)^{2}+(4z+3)^{2} .$$

绕轴旋转时高度 $z$ 与到轴距离都不变，故所求曲面为
$$(x-2)^{2}+(y-3)^{2}=(3z+2)^{2}+(4z+3)^{2} ,$$
展开即
$$(x-2)^{2}+(y-3)^{2}=25z^{2}+36z+13 .$$

@考点
旋转曲面方程的建立（到轴距离不变、沿轴坐标不变）；直线的参数方程；由一个坐标反解参数。

易混：只有当转轴**平行于坐标轴**时才能这样直接写；若转轴是一般直线（如上一份中绕 $x=y=z$ 旋转），要用向量的投影与距离公式。

@易错
1. 把转轴当成 $z$ 轴（忘了它过 $(2,3,0)$）。
2. 不反解参数，直接把 $t$ 留在方程里。
3. 距离写成一次式而不是平方。
4. 展开时算错常数项（$4+9=13$）。

[6]
@题目
设随机变量序列 $X_1,X_2,\cdots,X_n$ 独立，$X_i$ 的分布律为
| $X_i$ | $-ia$ | $0$ | $ia$ |
|---|---|---|---|
| $p$ | $\frac{1}{2i^2}$ | $1-\frac{1}{i^2}$ | $\frac{1}{2i^2}$ |
其中 $i=1,2,\cdots,n$，利用大数定律证明：
$$\lim_{n\to\infty}P\Big\{\Big|\frac{1}{n}\sum_{i=1}^{n}X_i\Big|\geqslant\varepsilon\Big\}=0.$$

@切入点
要证 $\dfrac1n\sum X_i$ 依概率收敛到 $0$，最直接的工具是**切比雪夫不等式**：只要算出 $\dfrac1n\sum X_i$ 的期望与方差，再让方差趋于零即可。

先算单个 $X_i$ 的数字特征。分布律关于 $0$ 对称，故
$$EX_i=(-ia)\frac{1}{2i^{2}}+0+ia\cdot\frac{1}{2i^{2}}=0 ,$$
$$DX_i=EX_i^{2}=2\cdot(ia)^{2}\cdot\frac{1}{2i^{2}}=a^{2} .$$
**方差竟然与 $i$ 无关**，恒等于 $a^{2}$——这是题目精心设计的：取值 $\pm ia$ 随 $i$ 增大，但概率 $\frac{1}{2i^{2}}$ 随 $i$ 减小，两者恰好抵消，使方差一致有界。这正是切比雪夫大数定律要求的"方差一致有界"条件。

于是由独立性
$$D(\frac1n\sum X_i)=\frac{1}{n^{2}}\sum DX_i=\frac{na^{2}}{n^{2}}=\frac{a^{2}}{n}\to0 ,$$
代入切比雪夫不等式即得结论。

@解答
由分布律（关于 $0$ 对称）
$$EX_i=(-ia)\cdot\frac{1}{2i^{2}}+0\cdot(1-\frac{1}{i^{2}})+ia\cdot\frac{1}{2i^{2}}=0 ,$$
$$DX_i=EX_i^{2}=(ia)^{2}\cdot\frac{1}{2i^{2}}+(ia)^{2}\cdot\frac{1}{2i^{2}}=a^{2} ,$$
即各 $X_i$ 的方差一致有界（都等于 $a^{2}$）。

记 $\overline X=\dfrac1n\displaystyle\sum_{i=1}^{n}X_i$。由 $X_1,\cdots,X_n$ 相互独立，
$$E\overline X=0,  D\overline X=\frac{1}{n^{2}}\sum_{i=1}^{n}DX_i=\frac{na^{2}}{n^{2}}=\frac{a^{2}}{n} .$$

由切比雪夫不等式，对任意 $\varepsilon>0$，
$$0\leqslant P\{|\frac1n\sum_{i=1}^{n}X_i|\geqslant\varepsilon\}\leqslant\frac{D\overline X}{\varepsilon^{2}}=\frac{a^{2}}{n\varepsilon^{2}}\to0 (n\to\infty) ,$$
由夹逼准则
$$\lim_{n\to\infty}P\{|\frac1n\sum_{i=1}^{n}X_i|\geqslant\varepsilon\}=0 .$$

@考点
离散型随机变量的期望与方差计算；切比雪夫不等式；切比雪夫大数定律的条件（相互独立 $+$ 方差一致有界）；独立时方差可加。

易混：切比雪夫大数定律不要求同分布，只要求独立且方差一致有界；本题 $X_i$ 的分布随 $i$ 变化，但方差恒为 $a^{2}$，正好满足。

@易错
1. $DX_i$ 算成 $i^{2}a^{2}$（漏掉概率因子 $\frac{1}{2i^{2}}$）或 $\frac{a^{2}}{i^{2}}$。
2. $D\overline X$ 写成 $\frac1n\sum DX_i$（少了一个 $\frac1n$）。
3. 不验证独立性就用方差可加。
4. 只写出不等式而不取极限、不用夹逼。

[7]
@题目
微分方程
$$y'\sec^2 y + \frac{x}{1 + x^2}\tan y = x$$
满足 $y(0) = 0$ 的特解为 ＿＿＿＿.

@切入点
方程
$$y'\sec^{2}y+\frac{x}{1+x^{2}}\tan y=x $$
中同时出现 $\sec^{2}y\cdot y'$ 与 $\tan y$，而 $(\tan y)'=\sec^{2}y\cdot y'$——**前者恰是后者的导数**！所以令
$$u=\tan y\Longrightarrow u'=\sec^{2}y\cdot y' ,$$
方程立刻变成关于 $u$ 的**一阶线性方程**
$$u'+\frac{x}{1+x^{2}}u=x .$$
识别这种"某函数与它的导数成对出现"的结构，是把非线性方程线性化的通用手段。

接下来是标准流程：积分因子
$$\mathrm e^{\int\frac{x}{1+x^{2}}dx}=\mathrm e^{\frac12\ln(1+x^{2})}=\sqrt{1+x^{2}} ,$$
凑成 $(\sqrt{1+x^{2}} u)'=x\sqrt{1+x^{2}}$，右端用凑微分积出 $\frac13(1+x^{2})^{3/2}$。

最后用 $y(0)=0$ 即 $u(0)=\tan0=0$ 定常数——注意初值要**先翻译到 $u$ 上**。

@解答
令 $u=\tan y$，则 $u'=\sec^{2}y\cdot y'$，原方程化为
$$u'+\frac{x}{1+x^{2}}u=x .$$
积分因子
$$\mu(x)=\mathrm e^{\int\frac{x}{1+x^{2}}dx}=\mathrm e^{\frac12\ln(1+x^{2})}=\sqrt{1+x^{2}} ,$$
故
$$(\sqrt{1+x^{2}} u)'=x\sqrt{1+x^{2}} .$$
积分（凑微分 $x dx=\frac12d(1+x^{2})$）：
$$\sqrt{1+x^{2}} u=\frac13(1+x^{2})^{\frac32}+C\Longrightarrow u=\frac{1+x^{2}}{3}+\frac{C}{\sqrt{1+x^{2}}} .$$

由 $y(0)=0$ 得 $u(0)=\tan0=0$：
$$0=\frac13+C\Longrightarrow C=-\frac13 .$$
故
$$\tan y=\frac{1+x^{2}}{3}-\frac{1}{3\sqrt{1+x^{2}}} ,$$
即
$$y=\arctan[\frac{1+x^{2}}{3}-\frac{1}{3\sqrt{1+x^{2}}}] .$$

@考点
通过换元把非线性方程化为一阶线性方程（识别"函数与其导数成对出现"）；一阶线性方程的积分因子法；初值条件的换元同步转换。

易混：这里的换元不是伯努利方程的 $z=y^{1-n}$，而是直接令 $u=\tan y$；判断依据是看方程中出现的是 $y$ 的哪个函数及其导数。

@易错
1. 没看出 $\sec^{2}y y'=(\tan y)'$，把方程当成不可解。
2. 积分因子算成 $1+x^{2}$（忘了指数上的 $\frac12$）。
3. 右端 $\int x\sqrt{1+x^{2}}dx$ 算错系数（应为 $\frac13$）。
4. 用初值时直接代 $y=0$ 而不换成 $u=0$。

[8]
@题目
设 $A, B$ 是 $n$ 阶可逆矩阵，且 $A^{-1} \sim B^{-1}$，则下列结果：
① $AB \sim BA$；② $A \sim B$；③ $A^{2} \sim B^{2}$；④ $A^{\mathrm{T}} \sim B^{\mathrm{T}}$
中正确的个数为（　　）.　A. 1　B. 2　C. 3　D. 4

@切入点
条件 $A^{-1}\sim B^{-1}$ 的标准用法是**写成定义式再取逆**：
$$\exists P\ \text{可逆}:\ P^{-1}A^{-1}P=B^{-1} .$$
两边取逆（注意 $(P^{-1}A^{-1}P)^{-1}=P^{-1}AP$）得
$$P^{-1}AP=B ,$$
即 **$A\sim B$**，而且用的是**同一个** $P$。②成立。

有了 $A\sim B$，后面几条都水到渠成：
- ③：$P^{-1}A^{2}P=(P^{-1}AP)^{2}=B^{2}$，故 $A^{2}\sim B^{2}$；
- ④：由 $B=P^{-1}AP$ 转置得 $B^{\mathrm T}=P^{\mathrm T}A^{\mathrm T}(P^{-1})^{\mathrm T}=P^{\mathrm T}A^{\mathrm T}(P^{\mathrm T})^{-1}$，故 $A^{\mathrm T}\sim B^{\mathrm T}$（相似变换矩阵换成了 $(P^{\mathrm T})^{-1}$）；
- ①：$AB$ 与 $BA$ 的相似性与题设无关，只要 $A$（或 $B$）**可逆**就有
$$AB=A(BA)A^{-1} ,$$
故 $AB\sim BA$。题设已给 $A$ 可逆。

四条全对，选 D。

这里值得记住两条通用小结论：**$A$ 可逆时 $AB\sim BA$**；**任何方阵与其转置相似**（更强，本题只需前述推导）。

@解答
由 $A^{-1}\sim B^{-1}$，存在可逆矩阵 $P$ 使
$$P^{-1}A^{-1}P=B^{-1} .$$
两边取逆：
$$(P^{-1}A^{-1}P)^{-1}=P^{-1}AP=B ,$$
故 **② $A\sim B$ 成立**。

**③**：由 $P^{-1}AP=B$ 得
$$P^{-1}A^{2}P=(P^{-1}AP)(P^{-1}AP)=B^{2} ,$$
故 $A^{2}\sim B^{2}$ 成立。

**④**：对 $B=P^{-1}AP$ 取转置，
$$B^{\mathrm T}=P^{\mathrm T}A^{\mathrm T}(P^{-1})^{\mathrm T}=P^{\mathrm T}A^{\mathrm T}(P^{\mathrm T})^{-1} ,$$
记 $Q=(P^{\mathrm T})^{-1}$（可逆），即 $Q^{-1}A^{\mathrm T}Q=B^{\mathrm T}$，故 $A^{\mathrm T}\sim B^{\mathrm T}$ 成立。

**①**：因 $A$ 可逆，
$$AB=A(BA)A^{-1} ,$$
故 $AB\sim BA$ 成立。

四个结论全部正确，选 **D**。

@考点
相似的定义式与取逆、取幂、取转置后的传递性；$A$ 可逆时 $AB\sim BA$；$(P^{-1}AP)^{-1}=P^{-1}A^{-1}P$。

易混：$AB$ 与 $BA$ 在 $A,B$ 都不可逆时未必相似（但特征值相同）；本题因 $A$ 可逆才有 ①。

@易错
1. ② 中取逆时把 $P$ 与 $P^{-1}$ 的位置弄反。
2. ④ 中忘了 $(P^{-1})^{\mathrm T}=(P^{\mathrm T})^{-1}$。
3. ① 中不用 $A$ 可逆这个条件而以为一般成立。
4. 误以为相似关系不能保持幂运算。

[9]
@题目
设 $\sum\limits_{n=0}^{\infty} a_n x^n$ 的收敛半径为 $3$，则
$$\sum_{n=0}^{\infty} n a_n (x + 1)^{n+1}$$
的收敛区间为 ＿＿＿＿.

@切入点
这类题只需回答两个问题：**新级数的收敛半径是多少？中心在哪里？**

半径：系数从 $a_n$ 变成 $na_n$。而 $\sqrt[n]{n}\to1$，所以乘上 $n$ **不改变收敛半径**（本质上 $\sum na_nx^{n}=x\sum na_nx^{n-1}$ 是逐项求导再乘 $x$，而逐项求导不改变收敛半径）。故半径仍是 $3$。

中心：级数写成 $(x+1)$ 的幂，故中心是 $x=-1$。注意通项是 $(x+1)^{n+1}$ 而不是 $(x+1)^{n}$，多出来的那个一次因子提出来：
$$\sum_{n=0}^{\infty}na_n(x+1)^{n+1}=(x+1)\sum_{n=0}^{\infty}na_n(x+1)^{n} ,$$
乘一个 $(x+1)$ 显然不影响收敛与否（$x=-1$ 时两边都收敛）。

于是收敛条件是 $|x+1|<3$，即
$$-4<x<2 .$$
题目问的是"收敛**区间**"（开区间，不含端点讨论），答 $(-4,2)$。

@解答
$\sum a_nx^{n}$ 的收敛半径为 $3$。因 $\sqrt[n]{n}\to1$，$\sum na_nx^{n}$ 的收敛半径也是 $3$（等价地：逐项求导不改变收敛半径）。

把多出的一次因子提出：
$$\sum_{n=0}^{\infty}na_n(x+1)^{n+1}=(x+1)\sum_{n=0}^{\infty}na_n(x+1)^{n} ,$$
故收敛条件为 $|x+1|<3$，即收敛区间为
$$(-4,\ 2) .$$

@考点
幂级数逐项求导、逐项积分不改变收敛半径；系数乘以 $n$（或除以 $n$）不改变收敛半径；非零中心幂级数的收敛区间 $|x-x_0|<R$。

易混："收敛区间"指开区间 $(x_0-R,x_0+R)$，"收敛域"还要讨论端点；本题只问区间，不必判端点。

@易错
1. 认为乘 $n$ 会使半径变小（记成 $\sqrt[n]{n}\to\infty$）。
2. 中心取成 $x=1$（把 $x+1$ 看反）。
3. 把 $(x+1)^{n+1}$ 的额外因子当成会改变收敛性。
4. 区间写成 $(-3,3)$（忘了平移）。

[10]
@题目
设 $A, B$ 均为 $n$ 阶矩阵，$E$ 为 $n$ 阶单位矩阵，矩阵
$$\begin{bmatrix} O & A \\ B & E \end{bmatrix}, \qquad \begin{bmatrix} A & B \\ O & E \end{bmatrix}, \qquad \begin{bmatrix} A & AB \\ E & B \end{bmatrix}$$
的秩分别为 $r_{1}, r_{2}, r_{3}$，则下列选项中正确的是（　　）.
A. $r_{2} \geqslant r_{1} \geqslant r_{3}$　B. $r_{3} \geqslant r_{1} \geqslant r_{2}$　C. $r_{1} \geqslant r_{2} \geqslant r_{3}$　D. $r_{3} \geqslant r_{2} \geqslant r_{1}$

@切入点
求分块矩阵的秩，标准武器是**分块初等变换**（整块地做行、列变换，秩不变）。目标是把每个矩阵化成"分块对角"的形式，然后用秩可加。

三个矩阵里都有一个单位块 $E$，它就是"消元的支点"：

- $\begin{pmatrix}O&A\\B&E\end{pmatrix}$：用第二块行左乘 $A$ 去消第一块行的 $A$（$\text{行}_1-A\cdot\text{行}_2$），再用第二块列右乘 $B$ 消掉 $B$，得 $\begin{pmatrix}-AB&O\\O&E\end{pmatrix}$，故 $r_1=n+\mathrm r(AB)$。
- $\begin{pmatrix}A&B\\O&E\end{pmatrix}$：$\text{行}_1-B\cdot\text{行}_2$ 消掉 $B$，得 $\begin{pmatrix}A&O\\O&E\end{pmatrix}$，故 $r_2=n+\mathrm r(A)$。
- $\begin{pmatrix}A&AB\\E&B\end{pmatrix}$：$\text{列}_2-\text{列}_1\cdot B$ 把两处都消成 $O$，得 $\begin{pmatrix}A&O\\E&O\end{pmatrix}$，而 $\begin{pmatrix}A\\E\end{pmatrix}$ 的秩恰为 $n$（有 $E$ 在），故 $r_3=n$。

最后比较：由 $\mathrm r(AB)\leqslant\mathrm r(A)$ 且 $\mathrm r(AB)\geqslant0$，得
$$r_2=n+\mathrm r(A)\geqslant r_1=n+\mathrm r(AB)\geqslant n=r_3 .$$

@解答
用分块初等变换（不改变秩）：

$$\begin{pmatrix}O&A\\B&E\end{pmatrix}\xrightarrow{\text{行}_1-A\cdot\text{行}_2}\begin{pmatrix}-AB&O\\B&E\end{pmatrix}\xrightarrow{\text{列}_1-\text{列}_2\cdot B}\begin{pmatrix}-AB&O\\O&E\end{pmatrix},$$
故 $r_1=n+\mathrm r(AB)$。

$$\begin{pmatrix}A&B\\O&E\end{pmatrix}\xrightarrow{\text{行}_1-B\cdot\text{行}_2}\begin{pmatrix}A&O\\O&E\end{pmatrix},$$
故 $r_2=n+\mathrm r(A)$。

$$\begin{pmatrix}A&AB\\E&B\end{pmatrix}\xrightarrow{\text{列}_2-\text{列}_1\cdot B}\begin{pmatrix}A&O\\E&O\end{pmatrix},$$
而 $\begin{pmatrix}A\\E\end{pmatrix}$ 含 $n$ 阶单位块，秩为 $n$，故 $r_3=n$。

又 $\mathrm r(AB)\leqslant\mathrm r(A)$ 且 $\mathrm r(AB)\geqslant0$，故
$$r_2\geqslant r_1\geqslant r_3 .$$
选 **A**。

@考点
分块初等变换保持秩；分块对角矩阵的秩可加；秩不等式 $\mathrm r(AB)\leqslant\min\{\mathrm r(A),\mathrm r(B)\}$；含单位块的分块矩阵秩至少为该块的阶。

易混：分块行变换是"某块行**左乘**矩阵后加到另一块行"，分块列变换是"某块列**右乘**矩阵后加到另一块列"；乘法的左右位置不能颠倒。

@易错
1. 分块变换时把左乘写成右乘，消不掉目标块。
2. 认为 $\begin{pmatrix}A&O\\E&O\end{pmatrix}$ 的秩是 $n+\mathrm r(A)$（其实只有 $n$，因为 $A$ 的列可被 $E$ 的列"覆盖"）。
3. 秩不等式方向记反。
4. 忘记 $\mathrm r(AB)$ 可以等于 $\mathrm r(A)$（故只能给非严格不等号）。

[11]
@题目
设 $(X,Y)$ 服从区域 $G=\{(x,y)\mid 0\leqslant x\leqslant2,0\leqslant y\leqslant1\}$ 上的均匀分布，求 $Z=XY$ 的分布函数与概率密度.

@切入点
$Z=XY$ 是**乘积**型变量函数，不像和那样有卷积公式，所以只能走**分布函数法**：
$$F_Z(z)=P\{XY\leqslant z\}=\iint_{xy\leqslant z}f(x,y)dxdy ,$$
本质是算区域 $G\cap\{xy\leqslant z\}$ 的面积再除以 $2$（均匀分布，密度 $\frac12$）。

先定 $Z$ 的取值范围：$X\in[0,2]$、$Y\in[0,1]$，故 $Z\in[0,2]$，分段点就是 $0$ 和 $2$。

再画区域：对 $0<z<2$，双曲线 $xy=z$ 与矩形 $[0,2]\times[0,1]$ 相交。以 $x$ 为主变量：
- 当 $x\leqslant z$ 时，任何 $y\in[0,1]$ 都满足 $xy\leqslant x\leqslant z$，整条竖线都算；
- 当 $x>z$ 时，只有 $y\leqslant\dfrac zx$（此时 $\frac zx<1$）。

于是面积
$$z\cdot1+\int_{z}^{2}\frac zx dx=z+z\ln\frac2z ,$$
再乘密度 $\frac12$。求导时注意 $\dfrac{d}{dz}[z\ln\frac2z]=\ln\frac2z-1$，与前面的 $1$ 恰好抵消，得到异常简洁的密度 $\frac12\ln\frac2z$。

@解答
$(X,Y)$ 在 $G=[0,2]\times[0,1]$ 上均匀分布，面积为 $2$，密度为 $\dfrac12$。因 $0\leqslant X\leqslant2$、$0\leqslant Y\leqslant1$，故 $0\leqslant Z\leqslant2$。

当 $z<0$ 时 $F_Z(z)=0$；当 $z\geqslant2$ 时 $F_Z(z)=1$。

当 $0\leqslant z<2$ 时，$\{xy\leqslant z\}\cap G$ 的面积为
$$\int_{0}^{z}1 dx+\int_{z}^{2}\frac zx dx=z+z\ln\frac2z ,$$
（$x\leqslant z$ 时整条竖线满足 $xy\leqslant x\leqslant z$；$x>z$ 时 $y\leqslant\frac zx<1$）。故
$$F_Z(z)=\frac12(z+z\ln\frac2z),  0\leqslant z<2 .$$

求导（$0<z<2$）：
$$f_Z(z)=\frac12[1+\ln\frac2z+z\cdot(-\frac1z)]=\frac12\ln\frac2z ,$$
即
$$f_Z(z)=\begin{cases}\dfrac12\ln\dfrac2z,&0<z<2,\\[4pt] 0,&\text{其他} .\end{cases}$$

@考点
乘积型随机变量函数的分布（只能用分布函数法）；二维均匀分布下"概率 $=$ 面积 $\times$ 密度"；分段计算区域面积；对含 $\ln$ 的分布函数求导。

易混：和 $X+Y$ 有卷积公式，商 $X/Y$、积 $XY$ 没有同样简单的公式，必须回到 $F_Z(z)=P\{g(X,Y)\leqslant z\}$ 的定义。

@易错
1. 不分段，直接写 $\int_0^2\frac zx dx$（在 $x<z$ 处 $\frac zx>1$ 超出 $y$ 的范围）。
2. 忘记乘密度 $\frac12$。
3. 求导时漏掉 $z\ln\frac2z$ 里的乘积求导。
4. $Z$ 的取值范围写成 $[0,1]$ 或 $[0,+\infty)$。

[12]
@题目
设 $D=\{(x,y)\mid (x-1)^2+(y-1)^2\leqslant 2\}$，$L$ 为 $D$ 的边界曲线，取顺时针方向，
$$I_1=\int_L x\,dx+\frac{(x+y)^2}{8}\,dy$$
$$I_2=\int_L x\,dx+\frac{(x-y)^2}{8}\,dy$$
$$I_3=\int_L \frac{(x+y)^2}{8}\,dx+y\,dy$$
则（　）．A. $I_1>I_2>I_3$　B. $I_3>I_2>I_1$　C. $I_2>I_3>I_1$　D. $I_2>I_1>I_3$

@切入点
三个积分都是沿同一条闭曲线（圆周，**顺时针**）的第二类曲线积分，所以统一用**格林公式**转成二重积分再比较大小，比逐个参数化快得多。

关键有三点：
1. **定向**：格林公式要求逆时针；题目取顺时针，所以要整体加负号。
2. **只需算 $\dfrac{\partial Q}{\partial x}-\dfrac{\partial P}{\partial y}$**：
 - $I_1$：$P=x$，$Q=\frac{(x+y)^{2}}{8}$，得 $\frac{x+y}{4}$；
 - $I_2$：$Q=\frac{(x-y)^{2}}{8}$，得 $\frac{x-y}{4}$；
 - $I_3$：$P=\frac{(x+y)^{2}}{8}$，$Q=y$，得 $-\frac{x+y}{4}$。
3. **用形心算积分**：$D$ 是圆心 $(1,1)$、半径 $\sqrt2$ 的圆盘，面积 $2\pi$，形心 $(1,1)$，故
$$\iint_D(x+y)d\sigma=(\overline x+\overline y)\cdot S=2\cdot2\pi=4\pi,  \iint_D(x-y)d\sigma=(\overline x-\overline y)S=0 .$$
第二个为零是因为 $D$ 关于直线 $y=x$ 对称——这一步能省掉全部计算。

结果 $I_1=-\pi$，$I_2=0$，$I_3=\pi$，故 $I_3>I_2>I_1$。

@解答
$D$ 是圆心 $(1,1)$、半径 $\sqrt2$ 的圆盘，面积 $S=2\pi$，形心为 $(1,1)$，故
$$\iint_D(x+y)d\sigma=(1+1)\cdot2\pi=4\pi,  \iint_D(x-y)d\sigma=(1-1)\cdot2\pi=0 .$$

$L$ 取顺时针，格林公式要加负号：

$$I_1:\ P=x,\ Q=\frac{(x+y)^{2}}{8},  \frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}=\frac{x+y}{4} ,$$
$$I_1=-\iint_D\frac{x+y}{4}d\sigma=-\frac{4\pi}{4}=-\pi .$$

$$I_2:\ Q=\frac{(x-y)^{2}}{8},  \frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}=\frac{x-y}{4},  I_2=-\iint_D\frac{x-y}{4}d\sigma=0 .$$

$$I_3:\ P=\frac{(x+y)^{2}}{8},\ Q=y,  \frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}=-\frac{x+y}{4},  I_3=-\iint_D(-\frac{x+y}{4})d\sigma=\pi .$$

故 $I_3>I_2>I_1$，选 **B**。

@考点
格林公式及其定向（逆时针为正，顺时针取负）；形心公式 $\iint_Dx d\sigma=\overline xS$；区域关于 $y=x$ 对称时 $\iint_D(x-y)d\sigma=0$。

易混：$\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}$ 中 $P$ 是 $dx$ 前的函数、$Q$ 是 $dy$ 前的函数；$I_3$ 里两者位置与 $I_1$ 相反，导致符号相反。

@易错
1. 忘记顺时针要变号，三个答案符号全反（会选成 A）。
2. $I_3$ 中把 $P,Q$ 认错。
3. 圆盘半径取成 $2$（$(x-1)^2+(y-1)^2\leqslant2$ 的半径是 $\sqrt2$，面积 $2\pi$）。
4. 不用形心，硬算 $\iint(x+y)d\sigma$。

[13]
@题目
设 $f(x,y)=\arcsin\sqrt{x^{2}+y^{4}}$，则下列选项中正确的是（　）.
A. $f'_x(0,0)$ 存在，$f'_y(0,0)$ 存在　　B. $f'_x(0,0)$ 不存在，$f'_y(0,0)$ 存在
C. $f'_x(0,0)$ 不存在，$f'_y(0,0)$ 不存在　　D. $f'_x(0,0)$ 存在，$f'_y(0,0)$ 不存在

@切入点
求分段点（这里是原点）处的偏导数，一律**回到定义**，并且要沿两条坐标轴分别算：
$$f'_x(0,0)=\lim_{x\to0}\frac{f(x,0)-f(0,0)}{x},  f'_y(0,0)=\lim_{y\to0}\frac{f(0,y)-f(0,0)}{y} .$$

本题的妙处在于**两条轴上函数的形状完全不同**：
- 沿 $x$ 轴：$f(x,0)=\arcsin\sqrt{x^{2}}=\arcsin|x|$。绝对值使得差商 $\dfrac{\arcsin|x|}{x}$ 在 $x\to0^{+}$ 时趋于 $1$、在 $x\to0^{-}$ 时趋于 $-1$，**左右不等，偏导数不存在**。
- 沿 $y$ 轴：$f(0,y)=\arcsin\sqrt{y^{4}}=\arcsin(y^{2})$。因为 $y^{4}$ 开方得 $y^{2}$（**自动非负，没有绝对值问题**），差商 $\dfrac{\arcsin y^{2}}{y}\sim\dfrac{y^{2}}{y}=y\to0$，偏导数存在且为 $0$。

所以关键是看清 $\sqrt{x^{2}}=|x|$（有尖点）而 $\sqrt{y^{4}}=y^{2}$（光滑）。

@解答
$f(0,0)=\arcsin0=0$。

**沿 $x$ 轴**：$f(x,0)=\arcsin\sqrt{x^{2}}=\arcsin|x|$，故
$$\frac{f(x,0)-f(0,0)}{x}=\frac{\arcsin|x|}{x} .$$
当 $x\to0^{+}$ 时它 $\to1$（$\arcsin x\sim x$）；当 $x\to0^{-}$ 时它 $=\dfrac{\arcsin(-x)}{x}\to-1$。左右极限不等，故 $f'_x(0,0)$ **不存在**。

**沿 $y$ 轴**：$f(0,y)=\arcsin\sqrt{y^{4}}=\arcsin(y^{2})$，故
$$f'_y(0,0)=\lim_{y\to0}\frac{\arcsin(y^{2})}{y}=\lim_{y\to0}\frac{y^{2}}{y}=0 ,$$
**存在**。

选 **B**。

@考点
分段点处偏导数的定义求法；$\sqrt{x^{2}}=|x|$ 与 $\sqrt{y^{4}}=y^{2}$ 的区别；等价无穷小 $\arcsin u\sim u$；左右导数不等则导数不存在。

易混：$\sqrt{x^{2}}$ 不等于 $x$（当 $x<0$ 时），而 $\sqrt{y^{4}}=y^{2}$ 恒成立——本题两个偏导数的不同命运正源于此。

@易错
1. 把 $\sqrt{x^{2}}$ 写成 $x$，得出 $f'_x(0,0)=1$。
2. 对表达式形式地求偏导（在原点处那个导数是无穷大，误判）。
3. 认为极限为 $\pm1$ 就"存在"。
4. 两条轴的计算弄混。

[14]
@题目
设 $n$ 阶矩阵 $A$ 满足 $|A| = 0$，$A_{ij}$ 为 $|A|$ 的元素 $a_{ij}$ 对应的代数余子式，且 $A_{11} \neq 0$，求方程组 $A^{*}x = 0$ 的基础解系和通解.

@切入点
题目要解 $A^{*}x=0$，但 $A^{*}$ 具体是什么并不知道。突破口是**伴随矩阵的两条性质**：

1. **秩**：$|A|=0$ 说明 $\mathrm r(A)\leqslant n-1$；而 $A_{11}\neq0$ 说明 $A$ 有一个 $n-1$ 阶子式非零，故 $\mathrm r(A)=n-1$。由秩公式 $\mathrm r(A^{*})=1$，于是 $A^{*}x=0$ 的解空间维数为
$$n-\mathrm r(A^{*})=n-1 .$$
2. **恒等式**：$A^{*}A=|A|E=O$。这个式子逐列来看，就是说 **$A$ 的每一列都是 $A^{*}x=0$ 的解**！

把两条一对照：$A$ 的列向量组的秩是 $\mathrm r(A)=n-1$，恰好等于解空间的维数，所以 **$A$ 的列空间就是整个解空间**，$A$ 的任意 $n-1$ 个线性无关的列即为基础解系。

最后指定一组具体的列：$A_{11}\neq0$ 意味着划去第 $1$ 行第 $1$ 列后的 $n-1$ 阶子式非零，因此 $A$ 的后 $n-1$ 列 $\alpha_2,\cdots,\alpha_n$ 线性无关，可取作基础解系。

@解答
由 $|A|=0$ 知 $\mathrm r(A)\leqslant n-1$；又 $A_{11}\neq0$ 说明 $A$ 存在非零的 $n-1$ 阶子式，故
$$\mathrm r(A)=n-1 .$$
由伴随矩阵的秩公式，$\mathrm r(A^{*})=1$，故 $A^{*}x=0$ 的解空间维数为
$$n-\mathrm r(A^{*})=n-1 .$$

又由 $A^{*}A=|A|E=O$，记 $A=(\alpha_1,\alpha_2,\cdots,\alpha_n)$，则
$$A^{*}\alpha_j=0 (j=1,2,\cdots,n) ,$$
即 $A$ 的每一列都是 $A^{*}x=0$ 的解。而 $\alpha_1,\cdots,\alpha_n$ 的秩为 $\mathrm r(A)=n-1$，恰等于解空间的维数，故 $A$ 的列向量组的极大无关组就是 $A^{*}x=0$ 的基础解系。

因 $A_{11}\neq0$（即划去第 $1$ 行第 $1$ 列所得的 $n-1$ 阶子式非零），$\alpha_2,\alpha_3,\cdots,\alpha_n$ 线性无关，故基础解系为
$$\alpha_2,\ \alpha_3,\ \cdots,\ \alpha_n ,$$
通解为
$$x=k_2\alpha_2+k_3\alpha_3+\cdots+k_n\alpha_n (k_2,\cdots,k_n\ \text{为任意常数}) .$$

@考点
伴随矩阵的秩公式（$\mathrm r(A)=n-1\Rightarrow\mathrm r(A^{*})=1$）；恒等式 $A^{*}A=AA^{*}=|A|E$；代数余子式非零 $\Leftrightarrow$ 相应的 $n-1$ 阶子式非零；"解的个数恰等于空间维数"时可直接断定张成关系。

易混：$A^{*}A=O$ 说明 $A$ 的**列**是 $A^{*}x=0$ 的解；若要 $A^{*}$ 的列与 $A$ 的关系，应看 $AA^{*}=O$（$A^{*}$ 的列是 $Ax=0$ 的解）。

@易错
1. 只求出解空间维数而找不到具体的基础解系。
2. 用 $\alpha_1,\cdots,\alpha_{n-1}$（未必线性无关，$A_{11}\neq0$ 保证的是后 $n-1$ 列）。
3. 由 $|A|=0$ 直接说 $\mathrm r(A)=n-1$（还需 $A_{11}\neq0$）。
4. 把 $\mathrm r(A^{*})$ 写成 $n-1$。

[15]
@题目
$$\lim_{n \to \infty} \frac{1}{n} \sum_{k=1}^{n} \frac{1}{3^k}(1 + \frac{1}{k})^{k^2} = \underline{\qquad\qquad}.$$

@切入点
这是一个"平均值型"极限：
$$\lim_{n\to\infty}\frac1n\sum_{k=1}^{n}c_k,  c_k=\frac{1}{3^{k}}(1+\frac1k)^{k^{2}} .$$
有一个通用结论（施笃兹定理或直接估计）：**若 $\sum c_k$ 收敛（设和为 $S$），则 $\frac1n\sum_{k=1}^{n}c_k=\frac{S_n}{n}\to\frac S{\infty}=0$**，因为部分和 $S_n$ 有界。

所以全部工作就是**判断 $\sum c_k$ 是否收敛**。

估计 $c_k$ 的阶：
$$(1+\frac1k)^{k^{2}}=\mathrm e^{k^{2}\ln(1+\frac1k)}=\mathrm e^{k^{2}(\frac1k-\frac{1}{2k^{2}}+O(\frac{1}{k^{3}}))}=\mathrm e^{k-\frac12+O(\frac1k)} ,$$
（这里必须展开到 $\frac{1}{2k^{2}}$ 这一项，否则得不到正确的指数阶）。于是
$$c_k\sim\mathrm e^{-\frac12}(\frac{\mathrm e}{3})^{k} ,$$
而 $\dfrac{\mathrm e}{3}<1$，等比级数收敛，故 $\sum c_k$ 收敛。

于是极限为 $0$。注意：如果误以为 $(1+\frac1k)^{k^{2}}\approx\mathrm e^{k}$ 而 $\frac{\mathrm e^{k}}{3^{k}}$ 仍然是收敛的等比级数，结论相同——但展开到位才能确信。

@解答
记 $c_k=\dfrac{1}{3^{k}}(1+\dfrac1k)^{k^{2}}$，$S_n=\displaystyle\sum_{k=1}^{n}c_k$。

**第一步：判断 $\sum c_k$ 收敛。** 由
$$k^{2}\ln(1+\frac1k)=k^{2}(\frac1k-\frac{1}{2k^{2}}+O(\frac{1}{k^{3}}))=k-\frac12+O(\frac1k) ,$$
得
$$(1+\frac1k)^{k^{2}}=\mathrm e^{k-\frac12+O(\frac1k)}\sim\mathrm e^{-\frac12}\mathrm e^{k} ,$$
故
$$c_k\sim\mathrm e^{-\frac12}(\frac{\mathrm e}{3})^{k} .$$
因 $0<\dfrac{\mathrm e}{3}<1$，等比级数 $\sum(\frac{\mathrm e}{3})^{k}$ 收敛，由比较判别法 $\sum c_k$ 收敛，记其和为 $S$，则 $S_n\to S$（有界）。

**第二步：取平均。**
$$\lim_{n\to\infty}\frac1n\sum_{k=1}^{n}c_k=\lim_{n\to\infty}\frac{S_n}{n}=\frac{S}{\infty}=0 .$$

故所求极限为 $0$。

@考点
$\infty^{\infty}$ 型的指数化处理 $a^{b}=\mathrm e^{b\ln a}$ 与泰勒展开定阶；等比级数的收敛条件；"收敛级数的部分和除以 $n$ 趋于零"。

易混：$(1+\frac1k)^{k}\to\mathrm e$，但 $(1+\frac1k)^{k^{2}}$ 是**指数级增长**的（约为 $\mathrm e^{k}$）；不要把两者混同。

@易错
1. 认为 $(1+\frac1k)^{k^{2}}\to\mathrm e$，得出通项趋于 $0$ 就说极限是 $0$（结论对但理由错，而且若底数换成大于 $\mathrm e$ 的数结论就变了）。
2. 展开 $\ln(1+\frac1k)$ 只到一阶，漏掉 $-\frac12$。
3. 误以为 $\frac1n\sum$ 是定积分的黎曼和。
4. 没说明 $S_n$ 有界就直接说极限为 $0$。

[16]
@题目
设随机变量 $X_1,X_2,\cdots,X_n$ 独立同分布，且有相同的概率密度，则概率 $P\{X_n>\min\{X_1,X_2,\cdots,X_{n-1}\}\}=$ ______.

@切入点
直接算 $P\{X_n>\min\{X_1,\cdots,X_{n-1}\}\}$ 要做积分，很麻烦。**取补事件**：
$$\{X_n\leqslant\min\{X_1,\cdots,X_{n-1}\}\}=\{X_n\ \text{是}\ X_1,\cdots,X_n\ \text{中的最小值}\} .$$
（因为 $X_n$ 不超过前 $n-1$ 个的最小值，等价于它不超过全部 $n$ 个。）

而 $X_1,\cdots,X_n$ **独立同分布且是连续型**，所以：
- 它们两两相等的概率为 $0$（连续型），最小值几乎必然唯一；
- 由**对称性**，最小值出现在第 $1,2,\cdots,n$ 个位置的概率相同，各为 $\dfrac1n$。

于是补事件的概率是 $\dfrac1n$，所求
$$P=1-\frac1n=\frac{n-1}{n} .$$

这个"用对称性代替计算"的思路是概率题里最省力的手法之一：**独立同分布的连续型变量，任何一个是最小（或最大）的概率都是 $\frac1n$**。

@解答
因 $X_1,\cdots,X_n$ 独立同分布且有概率密度（连续型），任意两个相等的概率为 $0$，故最小值几乎必然唯一。

考虑补事件：
$$\{X_n\leqslant\min\{X_1,\cdots,X_{n-1}\}\}=\{X_n=\min\{X_1,X_2,\cdots,X_n\}\} .$$
由 $X_1,\cdots,X_n$ 的对称性（同分布且独立），最小值取在第 $i$ 个位置的概率与 $i$ 无关，而这 $n$ 个事件互不相容且并为必然事件，故每个的概率都是 $\dfrac1n$。因此
$$P\{X_n>\min\{X_1,\cdots,X_{n-1}\}\}=1-\frac1n=\frac{n-1}{n} .$$

@考点
独立同分布连续型随机变量的对称性；补事件的使用；连续型变量取相同值的概率为零。

易混：若变量是离散型，可能出现并列最小值，上述"每个位置概率 $\frac1n$"的论证就不成立；题设"有相同的概率密度"正是为了排除这种情况。

@易错
1. 硬算 $n-1$ 重积分。
2. 把补事件写成 $\{X_n<\min\}$ 或漏掉等号（连续型时不影响，但推理要清楚）。
3. 答成 $\frac1n$（忘了取补）。
4. 忽略"同分布"这一条（对称性论证的前提）。

[17]
@题目
设 $L$ 是一条平面曲线，其上任意一点 $P(x, y)\ (x > 0)$ 到原点的距离恒等于该点处的切线在 $y$ 轴上的截距，且 $L$ 过点 $(\frac{1}{2}, 0)$. 求：
（Ⅰ）曲线 $L$ 的方程；
（Ⅱ）$L$ 位于第一象限部分的一条切线，使该切线与 $L$ 以及两坐标轴所围的面积最小.

@切入点
（Ⅰ）把几何条件翻译成方程。切线 $Y-y=y'(X-x)$ 在 $y$ 轴上的截距（令 $X=0$）是
$$y-xy' .$$
条件"到原点距离等于该截距"即
$$\sqrt{x^{2}+y^{2}}=y-xy' .$$
整理成 $y'=\dfrac{y-\sqrt{x^{2}+y^{2}}}{x}$，右端是 $\dfrac yx$ 的函数（$x>0$ 时 $\sqrt{x^{2}+y^{2}}=x\sqrt{1+u^{2}}$），是**齐次方程**，令 $u=\frac yx$ 即可。

解出隐式通解 $y+\sqrt{x^{2}+y^{2}}=C$ 后，用过点 $(\frac12,0)$ 定 $C=\frac12$，再**去根号化简**：把 $\sqrt{x^{2}+y^{2}}=\frac12-y$ 两边平方，$y^{2}$ 消掉，得到漂亮的抛物线
$$y=\frac14-x^{2} .$$

（Ⅱ）"切线与 $L$ 以及两坐标轴围成的面积"要分清是哪一块：抛物线上凸，切线在它上方，所求面积 $=$ **切线与两轴围成的三角形面积** $-$ **抛物线与两轴围成的面积**。后者是常数（与切点无关），所以只需**最小化三角形面积**。

设切点 $(a,\frac14-a^{2})$，切线 $y=\frac14+a^{2}-2ax$，两截距相乘除以 $2$ 得
$$\Delta(a)=\frac{(a^{2}+\frac14)^{2}}{4a} ,$$
求导得驻点 $a^{2}=\frac1{12}$。最后减去常数 $\frac1{12}$ 即得答案。

@解答
（Ⅰ）曲线在 $P(x,y)$ 处的切线为 $Y-y=y'(X-x)$，令 $X=0$ 得 $y$ 轴截距 $y-xy'$。由题意
$$\sqrt{x^{2}+y^{2}}=y-xy' (x>0) .$$
即
$$y'=\frac{y-\sqrt{x^{2}+y^{2}}}{x} .$$
令 $u=\dfrac yx$，$y'=u+xu'$，且 $\sqrt{x^{2}+y^{2}}=x\sqrt{1+u^{2}}$（$x>0$），得
$$u+xu'=u-\sqrt{1+u^{2}}\Longrightarrow \frac{du}{\sqrt{1+u^{2}}}=-\frac{dx}{x} .$$
积分：
$$\ln(u+\sqrt{1+u^{2}})=-\ln x+\ln C\Longrightarrow u+\sqrt{1+u^{2}}=\frac Cx ,$$
即
$$y+\sqrt{x^{2}+y^{2}}=C .$$
由 $L$ 过 $(\frac12,0)$ 得 $C=\frac12$。于是 $\sqrt{x^{2}+y^{2}}=\frac12-y$，平方得
$$x^{2}+y^{2}=\frac14-y+y^{2}\Longrightarrow x^{2}=\frac14-y ,$$
即
$$L:\ y=\frac14-x^{2} .$$

（Ⅱ）$L$ 在第一象限的部分为 $0<x<\dfrac12$。设切点为 $(a,\dfrac14-a^{2})$，$0<a<\dfrac12$。由 $y'=-2x$，切线为
$$y=(\frac14-a^{2})-2a(x-a)=\frac14+a^{2}-2ax .$$
它与 $y$ 轴交于 $(0,\ \frac14+a^{2})$，与 $x$ 轴交于 $(\dfrac{\frac14+a^{2}}{2a},\ 0)$，围成的三角形面积
$$\Delta(a)=\frac12\cdot(\frac14+a^{2})\cdot\frac{\frac14+a^{2}}{2a}=\frac{(a^{2}+\frac14)^{2}}{4a} .$$
求导：
$$\Delta'(a)=\frac{(a^{2}+\frac14)(3a^{2}-\frac14)}{4a^{2}} ,$$
故 $a^{2}=\dfrac{1}{12}$ 即 $a=\dfrac{\sqrt3}{6}$ 时 $\Delta$ 最小，
$$\Delta_{\min}=\frac{(\frac1{12}+\frac14)^{2}}{4\cdot\frac{\sqrt3}{6}}=\frac{\frac19}{\frac{2\sqrt3}{3}}=\frac{1}{6\sqrt3}=\frac{\sqrt3}{18} .$$
又抛物线与两坐标轴围成的面积
$$\int_{0}^{\frac12}(\frac14-x^{2})dx=\frac18-\frac{1}{24}=\frac1{12}$$
与 $a$ 无关。故所求最小面积为
$$\frac{\sqrt3}{18}-\frac{1}{12} ,$$
对应的切线为（$a=\frac{\sqrt3}{6}$，$\frac14+a^{2}=\frac13$，$2a=\frac{\sqrt3}{3}$）
$$y=\frac13-\frac{\sqrt3}{3}x .$$

@考点
切线的截距表达式 $y-xy'$；几何条件化为齐次微分方程；$\int\frac{du}{\sqrt{1+u^{2}}}=\ln(u+\sqrt{1+u^{2}})$；面积最值问题（"变化的部分"与"常数部分"分离）。

易混：所求面积中"抛物线与两轴围成的部分"是固定的，所以最小化整体等价于最小化三角形；先看出这一点能省去对复合面积求导的麻烦。

@易错
1. 截距写成 $y+xy'$ 或 $x-\frac{y}{y'}$（后者是 $x$ 轴截距）。
2. 解齐次方程时符号弄错（注意右端是 $-\sqrt{1+u^{2}}$）。
3. 平方去根号后忘记检验 $\frac12-y\geqslant0$。
4. 最后只答三角形面积，忘记减去抛物线下的面积。

[18]
@题目
函数
$$f(x)=\frac{2+e^{\frac{1}{x}}}{1+e^{\frac{2}{x}}}+\frac{\sin x}{|x|}$$
在 $x=0$ 处为（　）.
A. 可去间断点　　B. 跳跃间断点　　C. 无穷间断点　　D. 振荡间断点

@切入点
$x=0$ 处出现 $\mathrm e^{1/x}$ 与 $|x|$，两者都是"左右两侧行为完全不同"的标志，所以必须**分别求左、右极限**，再对照间断点的分类：
- 左右极限都存在且相等（但函数在该点无定义或值不等）→ **可去**；
- 左右极限都存在但不相等 → **跳跃**；
- 至少一侧为无穷 → **无穷**；
- 至少一侧振荡无极限 → **振荡**。

具体算：
- $x\to0^{+}$：$\frac1x\to+\infty$，$\mathrm e^{1/x}$ 与 $\mathrm e^{2/x}$ 都趋于 $+\infty$，但分母增长更快（$\mathrm e^{2/x}=(\mathrm e^{1/x})^{2}$），故第一项 $\to0$；而 $|x|=x$ 使第二项 $\frac{\sin x}{x}\to1$。合计 $f(0^{+})=1$。
- $x\to0^{-}$：$\frac1x\to-\infty$，两个指数都趋于 $0$，第一项 $\to\frac{2+0}{1+0}=2$；而 $|x|=-x$ 使第二项 $\frac{\sin x}{-x}\to-1$。合计 $f(0^{-})=2-1=1$。

**两个"完全不同"的计算竟然给出同一个值 $1$**——这就是本题的设计：两处差异恰好互相抵消，于是是可去间断点。

@解答
**右极限**（$x\to0^{+}$）：此时 $\dfrac1x\to+\infty$，
$$\frac{2+\mathrm e^{\frac1x}}{1+\mathrm e^{\frac2x}}=\frac{2\mathrm e^{-\frac2x}+\mathrm e^{-\frac1x}}{\mathrm e^{-\frac2x}+1}\to\frac{0+0}{0+1}=0 ,$$
又 $|x|=x$，$\dfrac{\sin x}{|x|}=\dfrac{\sin x}{x}\to1$，故
$$f(0^{+})=0+1=1 .$$

**左极限**（$x\to0^{-}$）：此时 $\dfrac1x\to-\infty$，$\mathrm e^{\frac1x}\to0$，$\mathrm e^{\frac2x}\to0$，
$$\frac{2+\mathrm e^{\frac1x}}{1+\mathrm e^{\frac2x}}\to\frac{2+0}{1+0}=2 ,$$
又 $|x|=-x$，$\dfrac{\sin x}{|x|}=\dfrac{\sin x}{-x}\to-1$，故
$$f(0^{-})=2-1=1 .$$

左右极限都存在且相等（均为 $1$），而 $f$ 在 $x=0$ 处无定义，故 $x=0$ 是**可去间断点**。

选 **A**。

@考点
$\mathrm e^{1/x}$ 在 $x\to0^{\pm}$ 时的不同行为；$|x|$ 的分段处理；间断点的四种分类及判别标准。

易混：$\mathrm e^{2/x}=(\mathrm e^{1/x})^{2}$，所以 $x\to0^{+}$ 时分母是分子的高阶无穷大，商趋于 $0$；不要把它当成 $\frac\infty\infty$ 就说"不存在"。

@易错
1. 只算一侧极限就下结论。
2. $x\to0^{+}$ 时把分式的极限算成 $1$ 或 $\infty$。
3. 忘记 $|x|$ 在左侧等于 $-x$，把第二项也算成 $1$。
4. 因函数在 $0$ 处无定义就判为"无穷间断点"。

[19]
@题目
设二次型 $f(x_1,x_2,x_3)=X^{\mathrm T}AX\ (A^{\mathrm T}=A)$ 经过正交变换 $X=QY$ 化为标准形 $2y_1^2-y_2^2-y_3^2$，又 $A^{*}\alpha=\alpha$，其中 $\alpha=(1,1,-1)^{\mathrm T}$，$A^{*}$ 是 $A$ 的伴随矩阵.
（Ⅰ）求正交矩阵 $Q$ 及实对称矩阵 $A$；
（Ⅱ）若正定矩阵 $B$ 满足 $B^2=A+2E$，求 $B$.

@切入点
（Ⅰ）两条信息要分别翻译：

**信息一**：正交变换化为 $2y_1^{2}-y_2^{2}-y_3^{2}$，说明 $A$ 的**特征值**是 $2,-1,-1$（正交变换下标准形的系数就是特征值）。于是 $|A|=2\cdot(-1)\cdot(-1)=2$。

**信息二**：$A^{*}\alpha=\alpha$。把伴随换成逆：$A^{*}=|A|A^{-1}=2A^{-1}$，代入得
$$2A^{-1}\alpha=\alpha\Longrightarrow A\alpha=2\alpha ,$$
即 $\alpha=(1,1,-1)^{\mathrm T}$ 是 $\lambda=2$ 的特征向量。**这是唯一能定出 $A$ 的信息**——否则只知道特征值，$A$ 不唯一。

有了 $\lambda=2$ 的特征方向，$\lambda=-1$ 的特征子空间就是 $\alpha$ 的正交补（实对称矩阵不同特征值的特征向量正交），在其中随便取两个正交向量单位化即可拼出 $Q$。

求 $A$ 时用**谱分解**最快：设 $P_1=\dfrac{\alpha\alpha^{\mathrm T}}{|\alpha|^{2}}=\dfrac{\alpha\alpha^{\mathrm T}}{3}$ 是到 $\alpha$ 方向的投影，则
$$A=2P_1+(-1)(E-P_1)=3P_1-E=\alpha\alpha^{\mathrm T}-E .$$

（Ⅱ）求正定的"平方根"$B$：$B^{2}=A+2E$ 的特征值是 $4,1,1$，正定要求 $B$ 的特征值取**正**平方根 $2,1,1$，且 $B$ 与 $A$ 有相同的特征向量。于是同样用谱分解：
$$B=2P_1+1\cdot(E-P_1)=P_1+E=\frac{\alpha\alpha^{\mathrm T}}{3}+E .$$
用投影算子写法可以完全避开矩阵乘法与开方。

@解答
（Ⅰ）由正交变换化为 $2y_1^{2}-y_2^{2}-y_3^{2}$ 知 $A$ 的特征值为 $2,-1,-1$，故 $|A|=2$。

由 $A^{*}=|A|A^{-1}=2A^{-1}$ 与 $A^{*}\alpha=\alpha$ 得
$$2A^{-1}\alpha=\alpha\Longrightarrow A\alpha=2\alpha ,$$
即 $\alpha=(1,1,-1)^{\mathrm T}$ 是 $\lambda=2$ 的特征向量。

因 $A$ 实对称，$\lambda=-1$ 的特征子空间是 $\alpha$ 的正交补。取其中两个正交向量 $\xi_2=(1,-1,0)^{\mathrm T}$、$\xi_3=(1,1,2)^{\mathrm T}$（验证 $\xi_2\cdot\alpha=\xi_3\cdot\alpha=\xi_2\cdot\xi_3=0$），单位化后得正交矩阵
$$Q=\begin{pmatrix}\frac{1}{\sqrt3}&\frac{1}{\sqrt2}&\frac{1}{\sqrt6}\\ \frac{1}{\sqrt3}&-\frac{1}{\sqrt2}&\frac{1}{\sqrt6}\\ -\frac{1}{\sqrt3}&0&\frac{2}{\sqrt6}\end{pmatrix},  Q^{\mathrm T}AQ=\mathrm{diag}(2,-1,-1) .$$

记 $P_1=\dfrac{\alpha\alpha^{\mathrm T}}{\alpha^{\mathrm T}\alpha}=\dfrac{\alpha\alpha^{\mathrm T}}{3}$，由谱分解
$$A=2P_1-(E-P_1)=3P_1-E=\alpha\alpha^{\mathrm T}-E=\begin{pmatrix}0&1&-1\\1&0&-1\\-1&-1&0\end{pmatrix} .$$

（Ⅱ）$A+2E$ 的特征值为 $4,1,1$，特征向量与 $A$ 相同。设 $B$ 正定且 $B^{2}=A+2E$，则 $B$ 的特征值为对应的正平方根 $2,1,1$，特征向量不变，故
$$B=2P_1+1\cdot(E-P_1)=P_1+E=\frac{\alpha\alpha^{\mathrm T}}{3}+E=\frac13\begin{pmatrix}4&1&-1\\1&4&-1\\-1&-1&4\end{pmatrix} .$$

@考点
正交变换下的标准形系数即特征值；$A^{*}=|A|A^{-1}$ 把伴随的特征关系转成 $A$ 的；实对称矩阵不同特征值的特征向量正交；谱分解 $A=\sum\lambda_iP_i$；正定矩阵平方根的唯一性。

易混：$A^{*}\alpha=\alpha$ 说明 $\alpha$ 是 $A^{*}$ 的特征向量（特征值 $1$），由 $A^{*}$ 与 $A$ 共用特征向量，转化为 $A\alpha=\frac{|A|}{1}\alpha=2\alpha$。

@易错
1. 只由特征值就想定出 $A$（$A$ 不唯一，必须用 $\alpha$）。
2. 由 $A^{*}\alpha=\alpha$ 误得 $A\alpha=\alpha$。
3. $Q$ 的列未单位化或未两两正交。
4. （Ⅱ）中取 $B$ 的特征值为 $\pm2,\pm1$（正定要求全取正）。

[20]
@题目
设 $f(x)$ 是连续函数，$F(x)$ 是 $f(x)$ 的原函数，则（　）.
A. 当 $f(x)$ 为奇函数时，$F(x)$ 必为偶函数
B. 当 $f(x)$ 为偶函数时，$F(x)$ 必为奇函数
C. 当 $f(x)$ 为周期函数时，$F(x)$ 必为周期函数
D. 当 $f(x)$ 为单调函数时，$F(x)$ 必为单调函数

@切入点
"原函数 $F$"意味着 $F(x)=\displaystyle\int_0^xf(t)dt+C$，其中 $C$ 是**任意常数**。所以判断每个选项时，关键问题是：**加上任意常数后，那条性质还保得住吗？**

- **A（$f$ 奇 $\Rightarrow F$ 偶）**：$\int_0^xf$ 是偶函数，而**偶函数加常数仍是偶函数**，所以对任意 $C$ 都成立。✓
- **B（$f$ 偶 $\Rightarrow F$ 奇）**：$\int_0^xf$ 是奇函数，但**奇函数加非零常数就不再是奇函数**（奇函数必须满足 $F(0)=0$）。✗
- **C（$f$ 周期 $\Rightarrow F$ 周期）**：取 $f\equiv1$（任意正数都是它的周期），$F=x+C$ 显然不周期。✗（一般地，$F$ 周期当且仅当 $f$ 在一个周期上的积分为 $0$。）
- **D（$f$ 单调 $\Rightarrow F$ 单调）**：取 $f(x)=x$ 单调增，$F=\frac{x^{2}}{2}+C$ 在 $(-\infty,0)$ 递减、$(0,+\infty)$ 递增，不单调。✗（$F$ 的单调性由 $f$ 的**符号**决定，与 $f$ 的单调性无关。）

一句话总结：**奇偶性里只有"偶"能扛住加常数**，这就是 A 与 B 命运不同的原因。

@解答
设 $F(x)=\displaystyle\int_{0}^{x}f(t)dt+C$（$C$ 为任意常数）。

**A 正确**：$f$ 为奇函数时，
$$\int_{0}^{-x}f(t)dt\ \overset{t=-s}{=}\ \int_{0}^{x}f(-s)ds=\int_{0}^{x}f(s)ds ,$$
即 $\int_0^xf$ 为偶函数；偶函数加常数仍为偶函数，故 $F$ 必为偶函数。

**B 错误**：$f$ 偶时 $\int_0^xf$ 为奇函数，但 $F=\int_0^xf+C$ 在 $C\neq0$ 时 $F(0)=C\neq0$，不是奇函数。例如 $f(x)=1$（偶），$F(x)=x+1$ 非奇。

**C 错误**：取 $f(x)\equiv1$（周期函数），$F(x)=x+C$ 不是周期函数。

**D 错误**：取 $f(x)=x$（单调增），$F(x)=\dfrac{x^{2}}{2}+C$ 在 $(-\infty,0)$ 上递减、在 $(0,+\infty)$ 上递增，不单调。

选 **A**。

@考点
原函数与变限积分的关系（相差一个任意常数）；变限积分的奇偶性反转；$F$ 单调由 $F'=f$ 的符号决定；周期函数的原函数何时仍周期。

易混：$f$ 奇 $\Rightarrow$ 所有原函数都偶；$f$ 偶 $\Rightarrow$ 只有**过原点的那一个**原函数是奇的。这个不对称性是本题的考点。

@易错
1. 认为 A、B 对称，两个都对或都错。
2. C 中误以为"导数周期则函数周期"。
3. D 中把 $f$ 的单调性与 $F$ 的单调性混为一谈。
4. 忘记原函数含任意常数。

[21]
@题目
设 $\alpha_{1} = (a_{1},a_{2},a_{3})^{\mathrm{T}}$，$\alpha_{2} = (b_{1},b_{2},b_{3})^{\mathrm{T}}$，$\alpha_{3} = (c_{1},c_{2},c_{3})^{\mathrm{T}}$，其中 $a_{i}^{2} + b_{i}^{2} \neq 0\ (i=1,2,3)$，则 3 条直线
$$a_{i}x + b_{i}y + c_{i} = 0 \qquad (i = 1,2,3)$$
恰好仅交于一点的充分必要条件是（　　）.
A. $\mathrm{r}(\alpha_{1},\alpha_{2},\alpha_{3}) = 3$　B. $\mathrm{r}(\alpha_{1},\alpha_{2},\alpha_{3}) = 1$　C. $\mathrm{r}(\alpha_{1},\alpha_{2},\alpha_{3}) = \mathrm{r}(\alpha_{1},\alpha_{2})$　D. $\mathrm{r}(\alpha_{1},\alpha_{2},\alpha_{3}) = \mathrm{r}(\alpha_{1},\alpha_{2}) = 2$

@切入点
把几何问题翻译成方程组：三条直线的公共点就是方程组
$$\begin{cases}a_1x+b_1y=-c_1,\\ a_2x+b_2y=-c_2,\\ a_3x+b_3y=-c_3\end{cases}$$
的解，未知数 $2$ 个、方程 $3$ 个。系数矩阵是 $(\alpha_1,\alpha_2)$（$3\times2$），增广矩阵是 $(\alpha_1,\alpha_2,-\alpha_3)$。

"恰好仅交于一点"就是"**有唯一解**"，其充要条件是
$$\mathrm r(\alpha_1,\alpha_2)=\mathrm r(\alpha_1,\alpha_2,-\alpha_3)=2 (=\text{未知数个数}) .$$
而 $\mathrm r(\alpha_1,\alpha_2,-\alpha_3)=\mathrm r(\alpha_1,\alpha_2,\alpha_3)$（乘 $-1$ 不改变秩），故条件即
$$\mathrm r(\alpha_1,\alpha_2)=\mathrm r(\alpha_1,\alpha_2,\alpha_3)=2 ,$$
正是选项 D。

再看其他选项为什么不行：
- A（$\mathrm r=3$）：此时增广秩大于系数秩，方程组**无解**，三线没有公共点；
- B（$\mathrm r=1$）：三个向量共线，此时 $\mathrm r(\alpha_1,\alpha_2)\leqslant1<2$，解不唯一（或无解）；
- C 只说两个秩相等（即有解），没要求等于 $2$，可能是无穷多解（三线重合）。

@解答
三条直线的公共点即方程组
$$\begin{cases}a_1x+b_1y=-c_1,\\ a_2x+b_2y=-c_2,\\ a_3x+b_3y=-c_3\end{cases}$$
的解，未知数个数为 $2$，系数矩阵为 $(\alpha_1,\alpha_2)$，增广矩阵为 $(\alpha_1,\alpha_2,-\alpha_3)$。

三直线恰交于一点 $\Longleftrightarrow$ 方程组有唯一解 $\Longleftrightarrow$
$$\mathrm r(\alpha_1,\alpha_2)=\mathrm r(\alpha_1,\alpha_2,-\alpha_3)=2 .$$
又 $\mathrm r(\alpha_1,\alpha_2,-\alpha_3)=\mathrm r(\alpha_1,\alpha_2,\alpha_3)$，故条件为
$$\mathrm r(\alpha_1,\alpha_2,\alpha_3)=\mathrm r(\alpha_1,\alpha_2)=2 .$$
选 **D**。

（A 对应无解；B 中 $\mathrm r(\alpha_1,\alpha_2)\leqslant1<2$，不可能唯一解；C 只保证有解，未排除无穷多解。）

@考点
直线的交点与线性方程组解的对应；有唯一解的充要条件 $\mathrm r(A)=\mathrm r(\overline A)=n$（$n$ 为未知数个数）；向量乘非零常数不改变秩。

易混：这里的"未知数个数"是 $2$（$x,y$），而向量 $\alpha_i$ 是 $3$ 维的（对应 $3$ 个方程）；不要把 $3$ 当成未知数个数。

@易错
1. 选 A（把"三个向量线性无关"当成交于一点）。
2. 选 C（忘了唯一性要求秩等于 $2$）。
3. 增广矩阵写成 $(\alpha_1,\alpha_2,\alpha_3)$ 时忘记说明符号不影响秩。
4. 忽略条件 $a_i^{2}+b_i^{2}\neq0$（它保证每个方程确实表示一条直线）。

[22]
@题目
设 $D:2x\leqslant x^{2}+y^{2}$，$0\leqslant y\leqslant x\leqslant 2$，则
$$I=\iint_{D}\frac{\mathrm{d}x\mathrm{d}y}{\sqrt{x^{2}+y^{2}}}=\underline{\qquad}$$

@切入点
被积函数 $\dfrac{1}{\sqrt{x^{2}+y^{2}}}=\dfrac1r$，而极坐标的面积元是 $r drd\theta$，两者相乘后 **$r$ 完全消掉**：
$$\frac{1}{r}\cdot r drd\theta=drd\theta .$$
所以极坐标下这个积分退化成"区域在 $(r,\theta)$ 平面上的面积"，内层积分就是 $r$ 的上下限之差——这是选择极坐标最强的理由。

再把三个条件翻译成极坐标：
- $2x\leqslant x^{2}+y^{2}$ 即 $r\geqslant2\cos\theta$（内边界是圆 $r=2\cos\theta$）；
- $0\leqslant y\leqslant x$ 即 $0\leqslant\theta\leqslant\dfrac\pi4$；
- $x\leqslant2$ 即 $r\leqslant\dfrac{2}{\cos\theta}$（外边界是直线 $x=2$）。

于是
$$I=\int_{0}^{\frac\pi4}(\frac{2}{\cos\theta}-2\cos\theta)d\theta=2\int_{0}^{\frac\pi4}(\sec\theta-\cos\theta)d\theta ,$$
剩下的是两个基本积分，其中 $\int\sec\theta d\theta=\ln|\sec\theta+\tan\theta|$ 要背熟。

@解答
化极坐标：被积函数 $\dfrac{1}{\sqrt{x^{2}+y^{2}}}=\dfrac1r$，面积元 $r drd\theta$，故
$$I=\iint_{D}\frac1r\cdot r drd\theta=\iint_{D}drd\theta .$$
区域条件：
$$x^{2}+y^{2}\geqslant2x\Longleftrightarrow r\geqslant2\cos\theta,  0\leqslant y\leqslant x\Longleftrightarrow0\leqslant\theta\leqslant\frac\pi4,  x\leqslant2\Longleftrightarrow r\leqslant\frac{2}{\cos\theta} .$$
（当 $\theta\in[0,\frac\pi4]$ 时 $2\cos\theta\leqslant\frac{2}{\cos\theta}$ 恒成立。）于是
$$I=\int_{0}^{\frac\pi4}\int_{2\cos\theta}^{\frac{2}{\cos\theta}}drd\theta=\int_{0}^{\frac\pi4}(\frac{2}{\cos\theta}-2\cos\theta)d\theta=2\int_{0}^{\frac\pi4}(\sec\theta-\cos\theta)d\theta .$$
由 $\displaystyle\int\sec\theta d\theta=\ln|\sec\theta+\tan\theta|$，
$$I=2[\ln(\sec\theta+\tan\theta)-\sin\theta]_{0}^{\frac\pi4}=2[\ln(\sqrt2+1)-\frac{\sqrt2}{2}]=2\ln(1+\sqrt2)-\sqrt2 .$$

@考点
极坐标下的二重积分；$\frac1r$ 与面积元中的 $r$ 相消；圆 $x^{2}+y^{2}=2x$ 的极坐标方程 $r=2\cos\theta$、直线 $x=2$ 的极坐标方程 $r=\frac{2}{\cos\theta}$；$\int\sec\theta d\theta=\ln|\sec\theta+\tan\theta|$。

易混：条件 $2x\leqslant x^{2}+y^{2}$ 是在圆的**外部**（$r\geqslant2\cos\theta$），不要弄反。

@易错
1. 忘记面积元中的 $r$，导致分母没消掉。
2. $\theta$ 的范围取成 $[0,\frac\pi2]$。
3. 内外边界弄反。
4. $\int\sec\theta d\theta$ 记错。

[23]
@题目
设曲面 $S:x^2+y^2+z^2=2x$，其密度为 $\rho=x^2+y^2+z^2$，则曲面 $S$ 的质量 $m=\underline{\qquad}$．

@切入点
先认出曲面：$x^{2}+y^{2}+z^{2}=2x$ 即 $(x-1)^{2}+y^{2}+z^{2}=1$，是球心 $(1,0,0)$、半径 $1$ 的**球面**，面积 $4\pi$。

再看密度：$\rho=x^{2}+y^{2}+z^{2}$。**在曲面上**这个量恰好等于 $2x$（就是曲面方程！），所以
$$m=\oiint_S\rho dS=\oiint_S2x dS ,$$
被积函数从二次降成了一次——这是"用曲面方程化简被积函数"的又一次应用，也是本题的全部技巧。

最后用**形心公式**：球面的形心就是球心，故 $\overline x=1$，
$$\oiint_Sx dS=\overline x\cdot(\text{面积})=1\cdot4\pi=4\pi ,$$
于是 $m=8\pi$。完全不需要参数化。

@解答
曲面 $S:x^{2}+y^{2}+z^{2}=2x$ 即 $(x-1)^{2}+y^{2}+z^{2}=1$，是球心 $(1,0,0)$、半径 $R=1$ 的球面，面积
$$A=4\pi R^{2}=4\pi .$$

在 $S$ 上 $x^{2}+y^{2}+z^{2}=2x$，故密度 $\rho=2x$，质量
$$m=\oiint_S\rho dS=2\oiint_Sx dS .$$
球面的形心即球心，$\overline x=1$，故
$$\oiint_Sx dS=\overline x\cdot A=4\pi ,$$
所以
$$m=2\cdot4\pi=8\pi .$$

@考点
第一类曲面积分的物理意义（质量 $=\iint\rho dS$）；用曲面方程化简被积函数；形心公式 $\iint_Sx dS=\overline x\cdot A$；球面的面积与形心。

易混：形心公式对第一类曲面积分成立（以面积为权），与三重积分的形心（以体积为权）是两回事，但形式相同。

@易错
1. 不化简密度，硬用球坐标参数化算 $\iint(x^{2}+y^{2}+z^{2})dS$。
2. 球心取成原点，$\overline x=0$，答成 $0$。
3. 球面面积写成 $\frac43\pi$（那是体积）。
4. 忘了乘 $2$。

[24]
@题目
在伯努利试验中，设事件发生的概率 $p=\dfrac{3}{4}$，$X$ 表示首次发生所需试验次数，$n$ 为正整数，则
$$\sum_{n=1}^{\infty}P\{X=2n\}=\underline{\hspace{3em}}.$$

@切入点
"首次发生所需试验次数"服从**几何分布**：
$$P\{X=k\}=(1-p)^{k-1}p=(\frac14)^{k-1}\cdot\frac34 (k=1,2,\cdots) .$$

所求是**只取偶数项**求和。把 $k=2n$ 代入：
$$P\{X=2n\}=(\frac14)^{2n-1}\cdot\frac34 ,$$
这是关于 $n$ 的等比数列，公比 $(\frac14)^{2}=\frac{1}{16}$，首项（$n=1$）为 $\frac14\cdot\frac34=\frac{3}{16}$。等比求和即可：
$$\sum_{n=1}^{\infty}=\frac{3/16}{1-1/16}=\frac{3}{15}=\frac15 .$$

**另一种更快的思路**（概率味道）：记 $q=1-p$。"首次成功发生在偶数次"意味着第一次失败、第二次成功，或前两次都失败后重新开始，于是
$$P=qp+q^{2}P\Longrightarrow P=\frac{qp}{1-q^{2}}=\frac{q}{1+q}=\frac{1/4}{5/4}=\frac15 .$$
这种"递推/重新开始"的想法值得掌握。

@解答
$X$ 服从参数 $p=\dfrac34$ 的几何分布：
$$P\{X=k\}=(\frac14)^{k-1}\cdot\frac34 (k=1,2,\cdots) .$$
故
$$\sum_{n=1}^{\infty}P\{X=2n\}=\frac34\sum_{n=1}^{\infty}(\frac14)^{2n-1}=\frac34\cdot\frac14\sum_{n=1}^{\infty}(\frac1{16})^{n-1}=\frac{3}{16}\cdot\frac{1}{1-\frac1{16}}=\frac{3}{16}\cdot\frac{16}{15}=\frac15 .$$

（另解：记 $q=\frac14$。首次成功在偶数次的概率 $P$ 满足 $P=qp+q^{2}P$，解得 $P=\dfrac{qp}{1-q^{2}}=\dfrac{q}{1+q}=\dfrac15$。）

@考点
几何分布的分布律；等比级数求和；"只取奇数项／偶数项"的级数处理；用"重新开始"的递推关系求概率。

易混：几何分布有两种写法——"首次成功所需次数 $X\geqslant1$"与"首次成功前失败次数 $Y\geqslant0$"；本题是前者，指数是 $k-1$。

@易错
1. 分布律写成 $p^{k-1}(1-p)$（成功概率与失败概率弄反）。
2. 公比取成 $\frac14$ 而不是 $\frac{1}{16}$。
3. 首项算错（$n=1$ 对应 $k=2$）。
4. 直接对全部 $k$ 求和得 $1$。

[25]
@题目
曲面 $z=x^{2}+y^{2}-1$ 在点 $P(2,1,4)$ 处的切平面方程为________，法线方程为________.

@切入点
切平面与法线的求法完全由**法向量**决定，而法向量就是把曲面写成 $F(x,y,z)=0$ 后的梯度。

把 $z=x^{2}+y^{2}-1$ 移项：
$$F(x,y,z)=x^{2}+y^{2}-1-z=0 ,$$
（注意把 $z$ 移到同一边，$F_z=-1$，这个 $-1$ 是最容易漏的）。于是
$$\nabla F=(2x,\ 2y,\ -1)|_{(2,1,4)}=(4,2,-1) .$$

有了法向量 $(4,2,-1)$ 和点 $(2,1,4)$：
- **切平面**：点法式 $4(x-2)+2(y-1)-1\cdot(z-4)=0$；
- **法线**：以法向量为方向的直线，$\dfrac{x-2}{4}=\dfrac{y-1}{2}=\dfrac{z-4}{-1}$。

也可以用显式曲面的公式 $\mathbf n=(z_x,z_y,-1)$，结果相同。

顺带检验：点 $(2,1,4)$ 确实在曲面上（$4+1-1=4$ ✓）。

@解答
把曲面写成 $F(x,y,z)=x^{2}+y^{2}-1-z=0$，则
$$\nabla F=(2x,\ 2y,\ -1) ,$$
在 $P(2,1,4)$ 处（验证 $2^{2}+1^{2}-1=4$，$P$ 在曲面上）
$$\mathbf n=(4,\ 2,\ -1) .$$

**切平面**（点法式）：
$$4(x-2)+2(y-1)-(z-4)=0\Longrightarrow 4x+2y-z-6=0 .$$

**法线**（过 $P$、方向为 $\mathbf n$）：
$$\frac{x-2}{4}=\frac{y-1}{2}=\frac{z-4}{-1} .$$

@考点
隐式曲面的法向量 $\nabla F$；显式曲面 $z=f(x,y)$ 的法向量 $(f_x,f_y,-1)$；切平面的点法式方程；法线的对称式方程。

易混：把 $z=f(x,y)$ 改写成 $F=0$ 时必须把 $z$ 也移过去，$F_z=-1$；若写成 $F=z-f(x,y)$ 则法向量是 $(-f_x,-f_y,1)$，方向相反但确定的是同一条法线、同一个平面。

@易错
1. 法向量写成 $(4,2)$ 或 $(4,2,1)$（漏掉或写错第三个分量）。
2. 切平面方程展开时常数项算错。
3. 法线方程分母写成切平面的系数的倒数。
4. 不验证 $P$ 在曲面上。

[26]
@题目
将
$$f(x) = \begin{cases} 1, & 1 < x < 2, \\ 3 - x, & 2 \leqslant x \leqslant 3 \end{cases}$$
展开为以 $2$ 为周期的傅里叶级数.

@切入点
这是一道**非标准区间**的傅里叶展开：周期是 $2$（即 $2l=2$，$l=1$），但函数给在 $[1,3]$ 上而不是习惯的 $[-1,1]$。

处理的要点是：**周期函数在任何一个长度为一个周期的区间上积分都相同**，所以系数公式照常用，只是积分区间取 $[1,3]$：
$$a_n=\frac1l\int_{1}^{3}f(x)\cos\frac{n\pi x}{l}dx=\int_{1}^{3}f(x)\cos n\pi x dx ,$$
$b_n$ 同理。不必先把函数平移到 $[-1,1]$。

计算时函数分两段（$1<x<2$ 上为 $1$，$2\leqslant x\leqslant3$ 上为 $3-x$），所以每个系数都是两段积分之和。第二段用换元 $t=3-x$ 会让 $3-x$ 变成 $t$，并利用
$$\cos(3n\pi-n\pi t)=(-1)^{n}\cos n\pi t,  \sin(3n\pi-n\pi t)=-(-1)^{n}\sin n\pi t$$
化成标准积分，比直接分部积分少出错。

最后要交代**收敛性**：$f$ 的周期延拓在 $x=2$ 处连续（左右都等于 $1$），在 $x=1,3$（同一个点的两侧）处有跳跃（$f(3^{-})=0$，$f(1^{+})=1$），由狄利克雷定理级数在该点收敛到 $\dfrac{0+1}{2}=\dfrac12$。

@解答
周期 $2l=2$，即 $l=1$。在一个周期区间 $[1,3]$ 上计算系数。

**常数项**：
$$\frac{a_0}{2}=\frac{1}{2l}\int_{1}^{3}f(x)dx=\frac12[\int_{1}^{2}1 dx+\int_{2}^{3}(3-x)dx]=\frac12(1+\frac12)=\frac34 .$$

**余弦系数**：
$$a_n=\int_{1}^{3}f(x)\cos n\pi x dx=\int_{1}^{2}\cos n\pi x dx+\int_{2}^{3}(3-x)\cos n\pi x dx .$$
第一项 $=[\dfrac{\sin n\pi x}{n\pi}]_1^2=0$。第二项令 $t=3-x$：
$$\int_{0}^{1}t\cos(3n\pi-n\pi t)dt=(-1)^{n}\int_{0}^{1}t\cos n\pi t dt=(-1)^{n}\cdot\frac{(-1)^{n}-1}{n^{2}\pi^{2}}=\frac{1-(-1)^{n}}{n^{2}\pi^{2}} ,$$
故
$$a_n=\frac{1-(-1)^{n}}{n^{2}\pi^{2}} .$$

**正弦系数**：
$$b_n=\int_{1}^{2}\sin n\pi x dx+\int_{2}^{3}(3-x)\sin n\pi x dx .$$
第一项 $=[-\dfrac{\cos n\pi x}{n\pi}]_1^2=\dfrac{(-1)^{n}-1}{n\pi}$。第二项同样令 $t=3-x$：
$$-(-1)^{n}\int_{0}^{1}t\sin n\pi t dt=-(-1)^{n}\cdot(-\frac{(-1)^{n}}{n\pi})=\frac{1}{n\pi} ,$$
故
$$b_n=\frac{(-1)^{n}-1}{n\pi}+\frac{1}{n\pi}=\frac{(-1)^{n}}{n\pi} .$$

因此
$$f(x)=\frac34+\sum_{n=1}^{\infty}[\frac{1-(-1)^{n}}{n^{2}\pi^{2}}\cos n\pi x+\frac{(-1)^{n}}{n\pi}\sin n\pi x] .$$

**收敛情况**：上式在 $f$ 的周期延拓的连续点（包括 $x=2$）处成立；在 $x=1,3$ 及其同余点处，延拓函数有跳跃（左极限 $0$、右极限 $1$），级数收敛于
$$\frac{0+1}{2}=\frac12 .$$

@考点
非对称区间上的傅里叶展开（周期函数在任一周期区间上的积分相同）；系数公式 $a_n=\frac1l\int f\cos\frac{n\pi x}{l}$、$b_n=\frac1l\int f\sin\frac{n\pi x}{l}$；换元化简分段积分；狄利克雷收敛定理（间断点收敛于左右极限的平均）。

易混：这里 $l=1$（半周期），所以 $\frac{n\pi x}{l}=n\pi x$，且系数前的因子是 $\frac1l=1$；若把周期误当成 $2\pi$，整套公式都会错。

@易错
1. 把周期 $2$ 当成半周期，写成 $\cos\frac{n\pi x}{2}$。
2. 积分区间取 $[-1,1]$ 而函数在那里没有定义。
3. 分段积分时第二段的换元符号出错。
4. 不讨论端点处的收敛值。

[27]
@题目
设 $\alpha, \beta$ 是 $n$ 维列向量，且 $\alpha^{\mathrm{T}}\beta = 2$，证明：$A = E + \alpha\beta^{\mathrm{T}}$ 可逆，并求 $A^{-1}$.

@切入点
$A=E+\alpha\beta^{\mathrm T}$ 是"单位阵 $+$ 秩 $1$ 矩阵"，这类矩阵有两条几乎是专用的结论：

1. **行列式公式**：$|E+\alpha\beta^{\mathrm T}|=1+\beta^{\mathrm T}\alpha$。本题 $\beta^{\mathrm T}\alpha=\alpha^{\mathrm T}\beta=2$（它是一个数，转置不变），故 $|A|=3\neq0$，可逆。
2. **逆的形状**：逆矩阵必定仍是 $E+k\alpha\beta^{\mathrm T}$ 的形式（因为这类矩阵关于乘法"封闭"）。所以**设 $A^{-1}=E+k\alpha\beta^{\mathrm T}$ 待定**，乘开定 $k$ 即可。

乘开时的关键仍然是提出标量：
$$(\alpha\beta^{\mathrm T})(\alpha\beta^{\mathrm T})=\alpha(\beta^{\mathrm T}\alpha)\beta^{\mathrm T}=2\alpha\beta^{\mathrm T} ,$$
于是
$$(E+\alpha\beta^{\mathrm T})(E+k\alpha\beta^{\mathrm T})=E+(1+k+2k)\alpha\beta^{\mathrm T} ,$$
令系数为零得 $k=-\dfrac13$。

若不记得行列式公式，也可以直接从这个乘积出发：只要 $1+3k=0$ 有解，就同时证明了可逆并求出了逆——**一步两得**，甚至不必单独证可逆。

@解答
因 $\alpha^{\mathrm T}\beta$ 是数，$\beta^{\mathrm T}\alpha=\alpha^{\mathrm T}\beta=2$，故
$$(\alpha\beta^{\mathrm T})(\alpha\beta^{\mathrm T})=\alpha(\beta^{\mathrm T}\alpha)\beta^{\mathrm T}=2\alpha\beta^{\mathrm T} .$$

设 $B=E+k\alpha\beta^{\mathrm T}$，则
$$AB=(E+\alpha\beta^{\mathrm T})(E+k\alpha\beta^{\mathrm T})=E+k\alpha\beta^{\mathrm T}+\alpha\beta^{\mathrm T}+2k\alpha\beta^{\mathrm T}=E+(1+3k)\alpha\beta^{\mathrm T} .$$
取 $k=-\dfrac13$，则 $AB=E$；同理 $BA=E$。故 $A$ 可逆，且
$$A^{-1}=E-\frac13\alpha\beta^{\mathrm T} .$$

（也可先由 $|E+\alpha\beta^{\mathrm T}|=1+\beta^{\mathrm T}\alpha=3\neq0$ 断定可逆。）

@考点
秩 $1$ 矩阵的运算 $(\alpha\beta^{\mathrm T})^{2}=(\beta^{\mathrm T}\alpha)\alpha\beta^{\mathrm T}$；行列式公式 $|E+\alpha\beta^{\mathrm T}|=1+\beta^{\mathrm T}\alpha$；用"造出 $AB=E$"同时证明可逆并求逆。

易混：$\alpha^{\mathrm T}\beta$（数）与 $\alpha\beta^{\mathrm T}$（$n$ 阶矩阵）；本题两者都出现，位置一旦写反就全错。

@易错
1. $(\alpha\beta^{\mathrm T})^{2}$ 算成 $(\alpha^{\mathrm T}\beta)^{2}E$ 之类。
2. 设 $A^{-1}$ 时形式取得过于一般（如设成任意矩阵），无法求解。
3. 只证可逆不求逆，或只求逆不说明可逆。
4. 行列式公式记成 $1+\alpha\beta^{\mathrm T}$（那是矩阵，不能与 $1$ 相加）。

[28]
@题目
设 $f(x)$ 在 $[0,1]$ 上二阶可导，且
$$f(0)=f(1)=2\int_{\frac{1}{2}}^{1}f(x)\,\mathrm{d}x$$
证明：
$$|f'(0)|+|f'(1)|\leqslant 1$$

@切入点
先看条件能给出什么。$f(0)=f(1)=2\displaystyle\int_{\frac12}^{1}f(x)dx$ 里那个积分，用**积分中值定理**可以换成一个函数值：存在 $\xi\in[\frac12,1]$ 使
$$2\int_{\frac12}^{1}f(x)dx=2\cdot\frac12f(\xi)=f(\xi) ,$$
于是条件变成
$$f(0)=f(\xi)=f(1) ,$$
**三个点的函数值相等**！这就为两次罗尔定理铺好了路：在 $[0,\xi]$ 与 $[\xi,1]$ 上各用一次，得到 $c\in(0,\xi)$、$d\in(\xi,1)$ 使
$$f'(c)=f'(d)=0 .$$

有了 $f'$ 的两个零点，再用**牛顿–莱布尼茨公式把 $f'(0)$、$f'(1)$ 表示成 $f''$ 的积分**：
$$f'(0)=f'(c)-\int_{0}^{c}f''dx=-\int_{0}^{c}f''dx,  f'(1)=f'(d)+\int_{d}^{1}f''dx=\int_{d}^{1}f''dx ,$$
于是 $|f'(0)|\leqslant c$、$|f'(1)|\leqslant1-d$（**这里要用 $|f''|\leqslant1$**），相加得
$$|f'(0)|+|f'(1)|\leqslant c+1-d<1 ,$$
最后一步用了 $c<\xi<d$。

**题干存疑**：上述推理必须有 $|f''(x)|\leqslant1$ 这个条件；若没有它，结论不成立。反例：取 $f(x)=C+M\sin4\pi x$，它满足 $f(0)=f(1)=C$ 且 $2\int_{1/2}^1f=C$，但 $|f'(0)|+|f'(1)|=8\pi|M|$ 可以任意大。故原题应附加 $|f''(x)|\leqslant1$，请对照原书核对。

@解答
（下面在附加条件 $|f''(x)|\leqslant1$ 下证明，见文末说明。）

由积分中值定理，存在 $\xi\in[\dfrac12,1]$ 使
$$2\int_{\frac12}^{1}f(x)dx=2\cdot(1-\frac12)f(\xi)=f(\xi) ,$$
故由题设
$$f(0)=f(\xi)=f(1) .$$

若 $\xi\in(0,1)$：在 $[0,\xi]$ 与 $[\xi,1]$ 上分别用罗尔定理，存在
$$c\in(0,\xi),  d\in(\xi,1),  f'(c)=f'(d)=0 .$$
（若 $\xi=1$，则直接在 $[0,1]$ 上用罗尔定理并适当取 $c=d$ 的讨论同理。）

由牛顿–莱布尼茨公式
$$f'(0)=f'(c)-\int_{0}^{c}f''(x)dx=-\int_{0}^{c}f''(x)dx, 
f'(1)=f'(d)+\int_{d}^{1}f''(x)dx=\int_{d}^{1}f''(x)dx ,$$
故由 $|f''|\leqslant1$，
$$|f'(0)|\leqslant\int_{0}^{c}|f''|dx\leqslant c,  |f'(1)|\leqslant\int_{d}^{1}|f''|dx\leqslant1-d .$$
相加并用 $c<\xi<d$：
$$|f'(0)|+|f'(1)|\leqslant c+1-d<\xi+1-\xi=1 .$$

**说明（题干需核对）**：若无条件 $|f''(x)|\leqslant1$，结论不成立。反例：$f(x)=C+M\sin4\pi x$ 满足 $f(0)=f(1)=C$ 与 $2\displaystyle\int_{\frac12}^{1}f dx=C$，但 $|f'(0)|+|f'(1)|=8\pi|M|$ 可任意大。故原题应含 $|f''(x)|\leqslant1$，请对照原书。

@考点
积分中值定理把积分条件换成函数值；罗尔定理（两次）制造 $f'$ 的零点；用牛顿–莱布尼茨公式把导数值表示为二阶导的积分并作估计。

易混：$2\int_{1/2}^1f dx$ 中的因子 $2$ 恰是区间长度 $\frac12$ 的倒数，所以中值定理给出的就是 $f(\xi)$ 本身，不带系数。

@易错
1. 不用积分中值定理，直接对积分条件下手。
2. 只用一次罗尔定理，得不到两个零点。
3. 估计时忘了把 $f'(c)=f'(d)=0$ 作为积分的起点。
4. 最后一步不说明 $c<d$，无法得到严格小于 $1$。

[29]
@题目
方程 $y'' + 2y' + y = xe^x$ 满足 $y(0) = 0, y'(0) = 0$ 的特解为 ＿＿＿＿.

@切入点
标准的二阶常系数非齐次方程，三步走：

1. **齐次解**：特征方程 $\lambda^{2}+2\lambda+1=(\lambda+1)^{2}=0$，$\lambda=-1$ 是**二重根**，齐次通解 $(C_1+C_2x)\mathrm e^{-x}$。
2. **特解**：右端 $x\mathrm e^{x}$ 对应的特征指数是 $1$，而特征根是 $-1$（二重），**$1$ 不是特征根，不共振**，故设
$$y^{*}=(ax+b)\mathrm e^{x} ,$$
不必乘 $x$。这一步的判断最关键：注意是拿右端的指数 $1$ 去和特征根比，而不是看 $\mathrm e^{-x}$。
3. **定常数**：代入后整理出 $(4ax+4a+4b)\mathrm e^{x}=x\mathrm e^{x}$，比较系数得 $a=\frac14$、$b=-\frac14$。

最后用两个初值 $y(0)=y'(0)=0$ 定 $C_1,C_2$。求 $y'$ 时不要漏掉特解部分的导数。

@解答
**齐次解**：特征方程 $\lambda^{2}+2\lambda+1=0$，$\lambda=-1$（二重），故
$$Y=(C_1+C_2x)\mathrm e^{-x} .$$

**特解**：右端 $x\mathrm e^{x}$ 中的指数 $1$ 不是特征根，设 $y^{*}=(ax+b)\mathrm e^{x}$，则
$$y^{*\prime}=(ax+a+b)\mathrm e^{x},  y^{*\prime\prime}=(ax+2a+b)\mathrm e^{x} ,$$
代入
$$y^{*\prime\prime}+2y^{*\prime}+y^{*}=(4ax+4a+4b)\mathrm e^{x}=x\mathrm e^{x} ,$$
比较系数：$4a=1$，$4a+4b=0$，得 $a=\dfrac14$，$b=-\dfrac14$，即
$$y^{*}=\frac{x-1}{4}\mathrm e^{x} .$$

**通解与定常数**：
$$y=(C_1+C_2x)\mathrm e^{-x}+\frac{x-1}{4}\mathrm e^{x} .$$
由 $y(0)=C_1-\dfrac14=0$ 得 $C_1=\dfrac14$；又
$$y'=(C_2-C_1-C_2x)\mathrm e^{-x}+\frac{x}{4}\mathrm e^{x} ,$$
由 $y'(0)=C_2-C_1=0$ 得 $C_2=\dfrac14$。故所求特解为
$$y=\frac{1+x}{4}\mathrm e^{-x}+\frac{x-1}{4}\mathrm e^{x} .$$

@考点
二阶常系数非齐次线性方程；二重特征根的齐次解形式 $(C_1+C_2x)\mathrm e^{\lambda x}$；待定系数法中共振的判定（比较右端指数与特征根）；用初值定常数。

易混：右端是 $x\mathrm e^{x}$（指数 $+1$），特征根是 $-1$，二者**不同**，所以不共振；若右端换成 $x\mathrm e^{-x}$，则要乘 $x^{2}$。

@易错
1. 误判共振，把特解设成 $x^{2}(ax+b)\mathrm e^{x}$。
2. 齐次解写成 $C_1\mathrm e^{-x}+C_2\mathrm e^{x}$。
3. 求 $y'$ 时漏掉特解的导数项。
4. 比较系数时把 $\mathrm e^{x}$ 也算进去。

[30]
@题目
设 $\alpha, \beta$ 为 3 维单位列向量，且 $\alpha^{\mathrm{T}}\beta = 0$，记 $A = \alpha\beta^{\mathrm{T}} + \beta\alpha^{\mathrm{T}}$.
（Ⅰ）证明：$A$ 相似于对角矩阵；
（Ⅱ）若存在 3 维列向量 $\gamma \neq 0$，使得 $A\gamma = 0$，记 $P = (\gamma,\ 2(\alpha+\beta),\ \beta-\alpha)$，求 $P^{-1}AP$.

@切入点
（Ⅰ）$A=\alpha\beta^{\mathrm T}+\beta\alpha^{\mathrm T}$ 显然满足 $A^{\mathrm T}=A$，是**实对称矩阵**，因而必可正交相似对角化——这一句话就能答完第一问。但题目还想让你看出具体的特征结构，所以最好把特征值和特征向量都找出来。

找特征向量的思路：$A$ 的作用只依赖于 $\alpha,\beta$ 两个方向，所以在 $\mathrm{span}\{\alpha,\beta\}$ 里试**对称的组合** $\alpha+\beta$ 与 $\alpha-\beta$。利用 $\alpha^{\mathrm T}\alpha=\beta^{\mathrm T}\beta=1$、$\alpha^{\mathrm T}\beta=0$：
$$A(\alpha+\beta)=\alpha(\beta^{\mathrm T}\alpha+\beta^{\mathrm T}\beta)+\beta(\alpha^{\mathrm T}\alpha+\alpha^{\mathrm T}\beta)=\alpha+\beta ,$$
$$A(\alpha-\beta)=\alpha(0-1)+\beta(1-0)=-(\alpha-\beta) .$$
再加上与 $\alpha,\beta$ 都正交的方向 $\gamma$（$A\gamma=0$），得到三个特征值 $1,-1,0$，**互不相同**，更强地保证了可对角化。

（Ⅱ）第二问几乎是白送的：只要认出 $P$ 的三列
$$\gamma,  2(\alpha+\beta),  \beta-\alpha=-(\alpha-\beta)$$
分别是 $\lambda=0,1,-1$ 的特征向量（**非零倍数仍是特征向量**，所以系数 $2$ 和负号都不影响），就有
$$P^{-1}AP=\mathrm{diag}(0,\ 1,\ -1) ,$$
顺序由 $P$ 的列顺序决定。

@解答
（Ⅰ）$A^{\mathrm T}=(\alpha\beta^{\mathrm T}+\beta\alpha^{\mathrm T})^{\mathrm T}=\beta\alpha^{\mathrm T}+\alpha\beta^{\mathrm T}=A$，故 $A$ 是实对称矩阵，必可（正交）相似于对角矩阵。

具体地，由 $\alpha^{\mathrm T}\alpha=\beta^{\mathrm T}\beta=1$、$\alpha^{\mathrm T}\beta=\beta^{\mathrm T}\alpha=0$：
$$A(\alpha+\beta)=\alpha(\beta^{\mathrm T}\alpha+\beta^{\mathrm T}\beta)+\beta(\alpha^{\mathrm T}\alpha+\alpha^{\mathrm T}\beta)=\alpha+\beta ,$$
$$A(\alpha-\beta)=\alpha(\beta^{\mathrm T}\alpha-\beta^{\mathrm T}\beta)+\beta(\alpha^{\mathrm T}\alpha-\alpha^{\mathrm T}\beta)=-\alpha+\beta=-(\alpha-\beta) ,$$
又取与 $\alpha,\beta$ 都正交的非零向量 $\gamma$，则 $A\gamma=\alpha(\beta^{\mathrm T}\gamma)+\beta(\alpha^{\mathrm T}\gamma)=0$。

故 $A$ 有三个互异特征值 $1,-1,0$，对应特征向量 $\alpha+\beta,\ \alpha-\beta,\ \gamma$，因而 $A$ 相似于对角矩阵。

（Ⅱ）$P=(\gamma,\ 2(\alpha+\beta),\ \beta-\alpha)$ 的三列分别是 $\lambda=0$、$\lambda=1$、$\lambda=-1$ 的特征向量（非零数乘不改变特征向量），故 $P$ 可逆且
$$P^{-1}AP=\begin{pmatrix}0&0&0\\0&1&0\\0&0&-1\end{pmatrix} .$$

@考点
实对称矩阵必可正交对角化；秩 $1$ 矩阵组合的特征结构；利用单位性与正交性 $\alpha^{\mathrm T}\alpha=1$、$\alpha^{\mathrm T}\beta=0$ 化简；相似对角化中 $P$ 的列与对角元的对应关系。

易混：$P^{-1}AP$ 的对角元顺序由 $P$ 的**列顺序**决定；本题 $P$ 的第一列是 $\gamma$，故第一个对角元是 $0$。

@易错
1. 只说"实对称必可对角化"而不给出特征值（第二问就没法做）。
2. 计算 $A(\alpha+\beta)$ 时把 $\beta^{\mathrm T}\alpha$ 与 $\beta^{\mathrm T}\beta$ 弄混。
3. 忽略 $\beta-\alpha$ 与 $\alpha-\beta$ 差一个负号仍是同一特征值的特征向量。
4. 对角元顺序写成 $\mathrm{diag}(1,-1,0)$。

[31]
@题目
设 $f(x)$ 在 $x=0$ 的某邻域内连续，$f(0)=0$，$\displaystyle\lim_{x\to 0}\frac{f(x)}{1-\cos x}=2$，则 $f(x)$ 在 $x=0$ 处（　）.
A. 不可导　　B. 可导且 $f'(0)\neq 0$　　C. 取得极大值　　D. 取得极小值

@切入点
条件
$$\lim_{x\to0}\frac{f(x)}{1-\cos x}=2$$
一次给出**两条**信息，要分别榨取：

**信息一（符号）**：极限为 $2>0$，故在 $0$ 的某去心邻域内 $\dfrac{f(x)}{1-\cos x}>0$；而 $1-\cos x>0$（$x\neq0$），所以
$$f(x)>0=f(0) ,$$
即 $f$ 在 $x=0$ 取得**极小值**。这就锁定了 D。

**信息二（阶）**：把差商拆开
$$\frac{f(x)}{x}=\frac{f(x)}{1-\cos x}\cdot\frac{1-\cos x}{x}\to2\cdot\lim_{x\to0}\frac{x^{2}/2}{x}=2\cdot0=0 ,$$
故 $f'(0)=0$ 存在。这同时否定了 A（可导）与 B（$f'(0)\neq0$）。

于是 A、B、C 全错，D 对。注意这道题里"取极小值"与"导数为零"是互相印证的（可导的极值点导数必为零）。

@解答
**（1）$f$ 在 $x=0$ 取极小值。** 由 $\displaystyle\lim_{x\to0}\frac{f(x)}{1-\cos x}=2>0$，存在 $\delta>0$，当 $0<|x|<\delta$ 时
$$\frac{f(x)}{1-\cos x}>0 .$$
又 $1-\cos x>0$（$0<|x|<\delta$，取 $\delta<2\pi$），故 $f(x)>0=f(0)$，即 $f$ 在 $x=0$ 处取得极小值。

**（2）$f$ 在 $x=0$ 可导且 $f'(0)=0$。** 因 $f(0)=0$，
$$f'(0)=\lim_{x\to0}\frac{f(x)-f(0)}{x}=\lim_{x\to0}\frac{f(x)}{1-\cos x}\cdot\frac{1-\cos x}{x}=2\cdot\lim_{x\to0}\frac{\frac{x^{2}}{2}}{x}=0 ,$$
故 A（不可导）与 B（$f'(0)\neq0$）都不正确；C（极大值）也不正确。

选 **D**。

@考点
极限的保号性（局部保持符号）；极值的定义（与邻域内函数值比较）；把差商拆成两个已知极限之积；$1-\cos x\sim\frac{x^{2}}{2}$。

易混：$f'(0)=0$ 只是可导极值点的必要条件；本题是**先由保号性得极值**，再顺带算出导数为零，两者互不依赖。

@易错
1. 只算导数得 $f'(0)=0$ 就下结论"取极值"（$f'(0)=0$ 不能推出极值）。
2. 忽略 $1-\cos x>0$ 这一事实，判不出 $f$ 的符号。
3. 把极小值误判为极大值。
4. 认为 $f$ 只连续所以不可导。

[32]
@题目
一个体积为 $V$、表面积为 $S$（不含底面）的雪堆，融化速度为 $\dfrac{dV}{dt}=-aS$（$a>0$ 为常数），设融化期间雪堆形状保持为
$$z=h-\frac{x^2+y^2}{h}\quad (z>0)$$
其中 $h=h(t)$，问一个高度为 $h_0\ (h_0>0)$ 的雪堆全部融化需要多长时间？

@切入点
这是"建立微分方程的应用题"，主线是：把 $V$ 与 $S$ 都用 $h$ 表示，代入 $\dfrac{dV}{dt}=-aS$ 得到关于 $h(t)$ 的方程。

**算 $V$**：曲面 $z=h-\dfrac{x^{2}+y^{2}}{h}$ 在 $z>0$ 处的投影是 $x^{2}+y^{2}<h^{2}$，用极坐标
$$V=\int_{0}^{2\pi}\int_{0}^{h}(h-\frac{r^{2}}{h})r drd\theta=\frac{\pi h^{3}}{2} .$$

**算 $S$**（侧面积，不含底）：$z_x=-\dfrac{2x}{h}$，$z_y=-\dfrac{2y}{h}$，
$$dS=\sqrt{1+\frac{4(x^{2}+y^{2})}{h^{2}}}dxdy ,$$
极坐标下换元 $u=1+\dfrac{4r^{2}}{h^{2}}$ 即可积出 $S=\dfrac{\pi h^{2}}{6}(5\sqrt5-1)$。

**关键的结构性发现**：$V\propto h^{3}$、$S\propto h^{2}$，代入 $\frac{dV}{dt}=-aS$ 后 $h^{2}$ **完全约掉**：
$$\frac{3\pi h^{2}}{2}\frac{dh}{dt}=-\frac{a\pi h^{2}}{6}(5\sqrt5-1)\Longrightarrow \frac{dh}{dt}=\text{常数} ,$$
即**高度随时间线性下降**！于是不必解复杂方程，直接线性外推到 $h=0$。这个"$h$ 匀速下降"的结论是本题最漂亮的地方。

@解答
**体积**：$z>0$ 对应 $x^{2}+y^{2}<h^{2}$，用极坐标
$$V=\int_{0}^{2\pi}\int_{0}^{h}(h-\frac{r^{2}}{h})r drd\theta=2\pi(\frac{h\cdot h^{2}}{2}-\frac{h^{4}}{4h})=2\pi\cdot\frac{h^{3}}{4}=\frac{\pi h^{3}}{2} .$$

**侧面积**：由 $z_x=-\dfrac{2x}{h}$，$z_y=-\dfrac{2y}{h}$，
$$S=\iint_{x^{2}+y^{2}\leqslant h^{2}}\sqrt{1+\frac{4(x^{2}+y^{2})}{h^{2}}}dxdy=2\pi\int_{0}^{h}r\sqrt{1+\frac{4r^{2}}{h^{2}}}dr .$$
令 $u=1+\dfrac{4r^{2}}{h^{2}}$（$r dr=\dfrac{h^{2}}{8}du$，$u:1\to5$）：
$$S=2\pi\cdot\frac{h^{2}}{8}\int_{1}^{5}\sqrt u du=\frac{\pi h^{2}}{4}\cdot\frac23(5\sqrt5-1)=\frac{\pi h^{2}}{6}(5\sqrt5-1) .$$

**建立方程**：由 $V=\dfrac{\pi h^{3}}{2}$ 得 $\dfrac{dV}{dt}=\dfrac{3\pi h^{2}}{2}\dfrac{dh}{dt}$，代入 $\dfrac{dV}{dt}=-aS$：
$$\frac{3\pi h^{2}}{2}\frac{dh}{dt}=-\frac{a\pi h^{2}}{6}(5\sqrt5-1)\Longrightarrow \frac{dh}{dt}=-\frac{a(5\sqrt5-1)}{9} ,$$
即 $h$ 随时间线性减小：
$$h(t)=h_0-\frac{a(5\sqrt5-1)}{9}t .$$
令 $h(T)=0$ 得全部融化所需时间
$$T=\frac{9h_0}{a(5\sqrt5-1)} .$$

@考点
旋转抛物面下的体积（二重积分）与曲面面积公式 $dS=\sqrt{1+z_x^{2}+z_y^{2}}dxdy$；由物理关系建立微分方程；量纲结构使方程退化为最简单的形式。

易混：题中 $S$ 是**不含底面**的侧面积；若把底面 $\pi h^{2}$ 也算进去，方程与答案都会变。

@易错
1. $V$ 算错（忘记极坐标的 $r$ 或上限取成 $h^{2}$）。
2. 曲面面积公式中漏掉 $1$，或把 $z_x$ 算成 $-\frac{2x}{h^{2}}$。
3. 换元后积分限没换。
4. 没注意到 $h^{2}$ 约掉，去解一个"复杂"的方程。

[33]
@题目
设二维随机变量 $(X,Y)$ 的概率密度为
$$f(x,y)=\frac{1}{k}(1+xy)\mathrm e^{-\frac{1}{2}(x^2+y^2)}\qquad (k>0,\ (x,y)\in\mathbf R^2).$$
（Ⅰ）求 $k$ 的值，并判别 $X$ 与 $Y$ 是否相互独立；
（Ⅱ）若 $Z$ 服从区间 $[-\pi,\pi]$ 上的均匀分布，且 $X$ 与 $Z$ 相互独立，求 $U=X+Z$ 的概率密度（可用 $\Phi(x)$ 表示）.

@切入点
（Ⅰ）定 $k$ 用**归一性**。积分
$$\iint_{\mathbb R^{2}}(1+xy)\mathrm e^{-\frac{x^{2}+y^{2}}{2}}dxdy$$
拆成两块：$\iint\mathrm e^{-\frac{x^{2}+y^{2}}{2}}=(\int\mathrm e^{-x^{2}/2}dx)^{2}=(\sqrt{2\pi})^{2}=2\pi$；而 $\iint xy\mathrm e^{-\frac{x^{2}+y^{2}}{2}}=0$（关于 $x$ 是奇函数）。故 $k=2\pi$。

判独立性时有一个**很值得记住的现象**：算边缘密度会发现
$$f_X(x)=\frac{1}{\sqrt{2\pi}}\mathrm e^{-\frac{x^{2}}{2}},  f_Y(y)=\frac{1}{\sqrt{2\pi}}\mathrm e^{-\frac{y^{2}}{2}} ,$$
即 $X,Y$ **都服从标准正态**，但 $f(x,y)\neq f_X(x)f_Y(y)$（差一个因子 $1+xy$），所以**不独立**。这说明"两个边缘都正态"并不能推出联合正态——本题正是这个经典反例。

（Ⅱ）$U=X+Z$ 是独立变量之和，用卷积。把 $Z$ 的密度（常数 $\frac{1}{2\pi}$ 在 $[-\pi,\pi]$ 上）放在外面最省事：
$$f_U(u)=\int_{-\pi}^{\pi}\frac{1}{2\pi}\varphi(u-z)dz ,$$
再换元 $t=u-z$ 把它化成标准正态密度在一个区间上的积分，正好用 $\Phi$ 表示。

@解答
（Ⅰ）由归一性，
$$k=\iint_{\mathbb R^{2}}(1+xy)\mathrm e^{-\frac{x^{2}+y^{2}}{2}}dxdy=\iint\mathrm e^{-\frac{x^{2}+y^{2}}{2}}dxdy+\iint xy\mathrm e^{-\frac{x^{2}+y^{2}}{2}}dxdy .$$
第一项 $=(\displaystyle\int_{-\infty}^{+\infty}\mathrm e^{-\frac{x^{2}}{2}}dx)^{2}=2\pi$；第二项因被积函数关于 $x$ 为奇函数而为 $0$。故
$$k=2\pi .$$

边缘密度：
$$f_X(x)=\frac{1}{2\pi}\int_{-\infty}^{+\infty}(1+xy)\mathrm e^{-\frac{x^{2}+y^{2}}{2}}dy=\frac{\mathrm e^{-\frac{x^{2}}{2}}}{2\pi}[\int\mathrm e^{-\frac{y^{2}}{2}}dy+x\int y\mathrm e^{-\frac{y^{2}}{2}}dy]=\frac{1}{\sqrt{2\pi}}\mathrm e^{-\frac{x^{2}}{2}} ,$$
同理 $f_Y(y)=\dfrac{1}{\sqrt{2\pi}}\mathrm e^{-\frac{y^{2}}{2}}$，即 $X,Y$ 都服从 $N(0,1)$。但
$$f_X(x)f_Y(y)=\frac{1}{2\pi}\mathrm e^{-\frac{x^{2}+y^{2}}{2}}\neq\frac{1+xy}{2\pi}\mathrm e^{-\frac{x^{2}+y^{2}}{2}}=f(x,y) ,$$
故 $X$ 与 $Y$ **不相互独立**。

（Ⅱ）$X\sim N(0,1)$，$Z\sim U[-\pi,\pi]$，二者独立。由卷积公式
$$f_U(u)=\int_{-\infty}^{+\infty}f_Z(z)f_X(u-z)dz=\frac{1}{2\pi}\int_{-\pi}^{\pi}\varphi(u-z)dz ,$$
其中 $\varphi$ 为标准正态密度。令 $t=u-z$（$z:-\pi\to\pi$ 对应 $t:u+\pi\to u-\pi$）：
$$f_U(u)=\frac{1}{2\pi}\int_{u-\pi}^{u+\pi}\varphi(t)dt=\frac{\Phi(u+\pi)-\Phi(u-\pi)}{2\pi},  -\infty<u<+\infty .$$

@考点
概率密度的归一性；奇偶对称性化简二重积分；边缘密度的计算；"边缘都正态但联合不是正态"的经典例子；独立随机变量和的卷积公式。

易混：两个边缘分布都是正态**不能**推出联合分布是二维正态，也不能推出独立；本题的 $1+xy$ 因子正是破坏联合正态性的来源。

@易错
1. 归一时忘记第二项为零，把 $k$ 算错。
2. 由"边缘都是 $N(0,1)$"直接说独立。
3. 卷积时把 $f_Z$ 的取值范围搞错（只有 $|z|\leqslant\pi$ 时才是 $\frac{1}{2\pi}$）。
4. 换元后上下限次序弄反，漏掉负号。

[34]
@题目
极限
$$\lim_{x\to 0}\frac{(\cos x-e^{\frac{x^{2}}{2}})\sin x^{2}}{\frac{x^{2}}{2}+1-\sqrt{1+x^{2}}}=\underline{\qquad\qquad}$$

@切入点
$\frac00$ 型且分子分母都是多项式式的组合，最稳的办法是**泰勒展开定阶**。核心是判断每一块展开到几阶：

- **分母** $\dfrac{x^{2}}{2}+1-\sqrt{1+x^{2}}$：由 $\sqrt{1+u}=1+\dfrac u2-\dfrac{u^{2}}{8}+o(u^{2})$（$u=x^{2}$），
$$\sqrt{1+x^{2}}=1+\frac{x^{2}}{2}-\frac{x^{4}}{8}+o(x^{4}) ,$$
故分母 $=\dfrac{x^{4}}{8}+o(x^{4})$——**前两阶全部抵消，只剩四阶**。这就告诉我们分子也必须展开到 $x^{4}$。
- **分子的第一个因子** $\cos x-\mathrm e^{x^{2}/2}$：
$$\cos x=1-\frac{x^{2}}{2}+o(x^{2}),  \mathrm e^{\frac{x^{2}}{2}}=1+\frac{x^{2}}{2}+o(x^{2}) ,$$
相减得 $-x^{2}+o(x^{2})$，是**二阶**。
- **第二个因子** $\sin x^{2}\sim x^{2}$，也是二阶。

分子合计四阶：$-x^{2}\cdot x^{2}=-x^{4}$。与分母的 $\frac{x^{4}}{8}$ 相比，极限为 $-8$。

这道题的教训是：**先看分母能"消到几阶"，再决定分子展开到几阶**，否则容易展少了得到 $\frac00$ 或展多了做无用功。

@解答
**分母**：由 $\sqrt{1+u}=1+\dfrac u2-\dfrac{u^{2}}{8}+o(u^{2})$，取 $u=x^{2}$：
$$\sqrt{1+x^{2}}=1+\frac{x^{2}}{2}-\frac{x^{4}}{8}+o(x^{4}) ,$$
故
$$\frac{x^{2}}{2}+1-\sqrt{1+x^{2}}=\frac{x^{4}}{8}+o(x^{4}) .$$

**分子**：
$$\cos x=1-\frac{x^{2}}{2}+o(x^{2}),  \mathrm e^{\frac{x^{2}}{2}}=1+\frac{x^{2}}{2}+o(x^{2}) ,$$
故
$$\cos x-\mathrm e^{\frac{x^{2}}{2}}=-x^{2}+o(x^{2}) ,$$
又 $\sin x^{2}\sim x^{2}$，故分子
$$(\cos x-\mathrm e^{\frac{x^{2}}{2}})\sin x^{2}=-x^{4}+o(x^{4}) .$$

因此
$$\lim_{x\to0}\frac{(\cos x-\mathrm e^{\frac{x^{2}}{2}})\sin x^{2}}{\frac{x^{2}}{2}+1-\sqrt{1+x^{2}}}=\lim_{x\to0}\frac{-x^{4}+o(x^{4})}{\frac{x^{4}}{8}+o(x^{4})}=-8 .$$

@考点
泰勒展开求 $\frac00$ 型极限；$(1+u)^{1/2}$、$\cos x$、$\mathrm e^{u}$ 的展开式；等价无穷小替换（只能用于乘除因子）；根据分母的阶决定分子展开的阶数。

易混：分母中 $1+\frac{x^{2}}{2}$ 与 $\sqrt{1+x^{2}}$ 的前两阶完全相同，差别从 $x^{4}$ 才开始；不展开到四阶就看不出来。

@易错
1. 分母只展开到 $x^{2}$，得到 $0$，误判极限为 $\infty$。
2. $\sqrt{1+x^{2}}$ 的 $x^{4}$ 系数记成 $+\frac18$。
3. 分子直接用等价替换 $\cos x-\mathrm e^{x^{2}/2}\sim$ 某个错误的量。
4. 符号漏掉（结果应为负）。

[35]
@题目
设有方程组
（Ⅰ）$$\begin{cases} x_{1} + x_{2} = 0, \\ x_{2} - x_{4} = 0, \end{cases}$$
（Ⅱ）$$Ax = 0$$
其中（Ⅱ）的基础解系为 $\alpha_{1} = (-1,2,2,1)^{\mathrm{T}}$，$\alpha_{2} = (0,-1,-1,0)^{\mathrm{T}}$，求方程组（Ⅰ）与（Ⅱ）的非零公共解.

@切入点
求两个方程组的公共解，有两条标准路线：

1. **联立法**：把（Ⅰ）的方程与（Ⅱ）的方程合在一起解。但本题（Ⅱ）没有给出方程，只给了**基础解系**，所以这条路走不通。
2. **代入法**（本题适用）：（Ⅱ）的解已经完全刻画为
$$x=k_1\alpha_1+k_2\alpha_2 ,$$
把这个一般形式**代入（Ⅰ）的方程**，得到关于 $k_1,k_2$ 的方程组，解出它们的关系即可。

这是"一方以基础解系给出"时的通用做法：**公共解一定在（Ⅱ）的解空间里，所以用它的参数表示，再让（Ⅰ）的方程去筛选参数**。

具体代入：
$$x=k_1(-1,2,2,1)^{\mathrm T}+k_2(0,-1,-1,0)^{\mathrm T}=(-k_1,\ 2k_1-k_2,\ 2k_1-k_2,\ k_1)^{\mathrm T} ,$$
两个方程 $x_1+x_2=0$ 与 $x_2-x_4=0$ 化简后**都给出 $k_1=k_2$**（两式重复，说明公共解空间是一维的）。于是公共解为 $k(\alpha_1+\alpha_2)$。

@解答
方程组（Ⅱ）的通解为
$$x=k_1\alpha_1+k_2\alpha_2=k_1(-1,2,2,1)^{\mathrm T}+k_2(0,-1,-1,0)^{\mathrm T}=(-k_1,\ 2k_1-k_2,\ 2k_1-k_2,\ k_1)^{\mathrm T} .$$

公共解必须同时满足（Ⅰ）：
$$x_1+x_2=-k_1+(2k_1-k_2)=k_1-k_2=0 ,$$
$$x_2-x_4=(2k_1-k_2)-k_1=k_1-k_2=0 .$$
两式都给出 $k_1=k_2$。记 $k_1=k_2=k$，则
$$x=k(\alpha_1+\alpha_2)=k(-1,\ 1,\ 1,\ 1)^{\mathrm T} .$$

故非零公共解为
$$x=k(-1,1,1,1)^{\mathrm T},  k\neq0 .$$

@考点
两个齐次方程组公共解的求法；当一方以基础解系给出时用"代入参数"法；公共解空间是两个解空间的交。

易混：若两个方程组都以方程形式给出，直接联立更快；若一方给的是基础解系，就用代入法。选对方法能省很多力气。

@易错
1. 试图由基础解系反推（Ⅱ）的方程再联立（可行但绕远）。
2. 代入后只用一个方程，漏掉另一个（本题两个方程恰好等价，但一般情形要都用）。
3. 把 $\alpha_1+\alpha_2$ 算错。
4. 忘记"非零"要求。

[36]
@题目
$f(x) = \int_0^x e^{-t^2}\,dt$ 展开为 $x$ 的幂级数为 ＿＿＿＿.

@切入点
$f(x)=\displaystyle\int_0^x\mathrm e^{-t^{2}}dt$ 的被积函数没有初等原函数，所以**不能先积分再展开**；正确顺序是**先展开被积函数、再逐项积分**。这是"变限积分求幂级数"的通法。

$\mathrm e^{u}=\sum\dfrac{u^{n}}{n!}$ 对一切实数成立，取 $u=-t^{2}$：
$$\mathrm e^{-t^{2}}=\sum_{n=0}^{\infty}\frac{(-1)^{n}t^{2n}}{n!} ,$$
收敛域是全实轴，所以可以在任意区间上逐项积分。积分后指数加一、再除以新指数：
$$\int_0^xt^{2n}dt=\frac{x^{2n+1}}{2n+1} ,$$
于是系数成为 $\dfrac{(-1)^{n}}{n!(2n+1)}$。

注意分母是 $n!(2n+1)$ 两个因子的乘积——一个来自指数函数的展开、一个来自积分，**两者都不能漏**。收敛域仍是 $(-\infty,+\infty)$（逐项积分不改变收敛半径）。

@解答
由 $\mathrm e^{u}=\displaystyle\sum_{n=0}^{\infty}\frac{u^{n}}{n!}$（$-\infty<u<+\infty$），取 $u=-t^{2}$：
$$\mathrm e^{-t^{2}}=\sum_{n=0}^{\infty}\frac{(-1)^{n}t^{2n}}{n!},  -\infty<t<+\infty .$$
在 $[0,x]$ 上逐项积分（幂级数在收敛区间内可逐项积分）：
$$f(x)=\int_{0}^{x}\mathrm e^{-t^{2}}dt=\sum_{n=0}^{\infty}\frac{(-1)^{n}}{n!}\int_{0}^{x}t^{2n}dt=\sum_{n=0}^{\infty}\frac{(-1)^{n}}{n!(2n+1)}x^{2n+1} ,$$
收敛域为 $(-\infty,+\infty)$。

@考点
$\mathrm e^{u}$ 的幂级数展开；幂级数在收敛区间内可逐项积分且收敛半径不变；变限积分函数的幂级数展开（先展开被积函数）。

易混：$\mathrm e^{-t^{2}}$ 与 $\mathrm e^{-t}$ 的展开不同，前者只含偶次幂；代入时 $u=-t^{2}$，$u^{n}=(-1)^{n}t^{2n}$。

@易错
1. 试图先求出 $\int\mathrm e^{-t^{2}}dt$ 的初等原函数。
2. 分母只写 $n!$ 或只写 $2n+1$。
3. 指数写成 $x^{2n}$（积分后应为 $2n+1$）。
4. 忘记写收敛域。

[37]
@题目
设 $f(x)$ 在 $[0, 1]$ 上有连续导数，$f(0) = 1, f'_+(0) = 1$，且
$$\iint\limits_D f''(x + y)\,dx\,dy = \iint\limits_D [f(x + y) + (x - y)^3]\,dx\,dy,$$
其中 $D = \{(x, y) \mid 0 \leqslant y \leqslant t - x,\ 0 \leqslant x \leqslant t\}\ (0 < t \leqslant 1)$，求 $f(x)$.

@切入点
条件是一个**对一切 $t\in(0,1]$ 都成立的二重积分等式**，所以策略是：先把两端的二重积分都化成关于 $t$ 的一元积分，再对 $t$ 求导，把积分方程变成微分方程。

两个化简技巧：

1. **形如 $g(x+y)$ 在三角形 $D:\ x,y\geqslant0,\ x+y\leqslant t$ 上的积分**有现成公式
$$\iint_Dg(x+y)dxdy=\int_{0}^{t}u g(u)du ,$$
因为 $\{x+y\leqslant u\}\cap D$ 的面积是 $\frac{u^{2}}{2}$，其导数（即"$x+y=u$ 这条线上的权重"）恰为 $u$。这个公式把二重积分一步降成一元积分。
2. **$\displaystyle\iint_D(x-y)^{3}dxdy=0$**：$D$ 关于直线 $y=x$ 对称，而 $(x-y)^{3}$ 在交换 $x,y$ 时变号，积分为零。看出这一点就省掉了一整块计算。

于是条件化为
$$\int_{0}^{t}uf''(u)du=\int_{0}^{t}uf(u)du (\forall t\in(0,1]) ,$$
两边对 $t$ 求导得 $tf''(t)=tf(t)$，约去 $t>0$ 即
$$f''=f ,$$
一个最基本的常系数方程。最后用 $f(0)=1$、$f'(0)=1$ 定常数。

@解答
$D=\{(x,y):x\geqslant0,\ y\geqslant0,\ x+y\leqslant t\}$ 是直角三角形，关于直线 $y=x$ 对称。

**第一步：化简两个二重积分。**

对形如 $g(x+y)$ 的被积函数，由 $\{x+y\leqslant u\}\cap D$ 的面积为 $\dfrac{u^{2}}{2}$ 得
$$\iint_Dg(x+y)dxdy=\int_{0}^{t}u g(u)du .$$
又 $(x-y)^{3}$ 在交换 $x,y$ 时变号而 $D$ 关于 $y=x$ 对称，故
$$\iint_D(x-y)^{3}dxdy=0 .$$

于是条件化为
$$\int_{0}^{t}uf''(u)du=\int_{0}^{t}uf(u)du (\forall t\in(0,1]) .$$

**第二步：求导化为微分方程。** 两边对 $t$ 求导：
$$tf''(t)=tf(t)\Longrightarrow f''(t)=f(t) (0<t\leqslant1) ,$$
由连续性该式在 $[0,1]$ 上成立。

**第三步：解方程并定常数。** 特征方程 $\lambda^{2}-1=0$，$\lambda=\pm1$，
$$f(x)=C_1\mathrm e^{x}+C_2\mathrm e^{-x} .$$
由 $f(0)=C_1+C_2=1$、$f'(0)=C_1-C_2=1$ 得 $C_1=1$，$C_2=0$。故
$$f(x)=\mathrm e^{x} .$$

@考点
$\iint_Dg(x+y)dxdy=\int_0^tu g(u)du$（三角形区域上的降维公式）；对称性化简；含参积分等式两边对参数求导化为微分方程；二阶常系数齐次方程。

易混：降维公式中的权重 $u$ 来自"等值线 $x+y=u$ 与 $D$ 相交的长度（按面积测度）"；若区域换成正方形，权重就不是 $u$ 了。

@易错
1. 不化简二重积分，直接对 $t$ 求导（上限与被积函数都含 $t$，容易出错）。
2. 漏掉 $(x-y)^{3}$ 项为零的判断，被它卡住。
3. 求导后忘记约去 $t$。
4. 解 $f''=f$ 时写成 $f=C_1\cos x+C_2\sin x$（那是 $f''=-f$）。

[38]
@题目
设平面曲线 $L$ 为 $|\ln x|+|\ln y|=1$，取逆时针方向，计算
$$I=\oint_L \frac{-y\,dx+x\,dy}{|\ln x|+|\ln y|}$$

@切入点
被积函数的分母 $|\ln x|+|\ln y|$ 看着吓人，但**积分路径就是 $|\ln x|+|\ln y|=1$**，所以在 $L$ 上分母恒等于 $1$，直接消失：
$$I=\oint_L(-y dx+x dy) .$$
这又是"用曲线方程化简被积函数"的经典一刀。

化简后是最熟悉的面积型积分：对逆时针闭曲线
$$\oint_L(x dy-y dx)=2S ,$$
$S$ 为所围面积。于是问题变成"求 $|\ln x|+|\ln y|=1$ 围成的面积"。

这个区域在 $(x,y)$ 平面上形状古怪，但**换元 $u=\ln x$、$v=\ln y$** 后立刻变成标准的菱形 $|u|+|v|\leqslant1$。换元的雅可比：$x=\mathrm e^{u}$，$y=\mathrm e^{v}$，$dxdy=\mathrm e^{u+v}dudv$。于是
$$S=\iint_{|u|+|v|\leqslant1}\mathrm e^{u+v}dudv .$$
再作旋转换元 $s=u+v$、$d=u-v$（此时 $|u|+|v|=\max(|s|,|d|)$，菱形变成正方形 $|s|\leqslant1,|d|\leqslant1$，雅可比 $\frac12$），积分完全分离：
$$S=\frac12\int_{-1}^{1}\int_{-1}^{1}\mathrm e^{s} dd ds=\int_{-1}^{1}\mathrm e^{s}ds=\mathrm e-\frac1{\mathrm e} .$$

@解答
在 $L$ 上 $|\ln x|+|\ln y|=1$，故
$$I=\oint_L(-y dx+x dy)=\oint_L(x dy-y dx)=2S ,$$
其中 $S$ 为 $L$ 所围区域的面积（$L$ 取逆时针）。

令 $u=\ln x$，$v=\ln y$，即 $x=\mathrm e^{u}$，$y=\mathrm e^{v}$，则 $L$ 的内部对应 $|u|+|v|\leqslant1$，且
$$dxdy=|\frac{\partial(x,y)}{\partial(u,v)}|dudv=\mathrm e^{u}\mathrm e^{v}dudv=\mathrm e^{u+v}dudv ,$$
故
$$S=\iint_{|u|+|v|\leqslant1}\mathrm e^{u+v}dudv .$$
再令 $s=u+v$，$d=u-v$（则 $|u|+|v|=\max(|s|,|d|)$，区域成为正方形 $|s|\leqslant1$、$|d|\leqslant1$，且 $dudv=\frac12dsdd$）：
$$S=\frac12\int_{-1}^{1}\int_{-1}^{1}\mathrm e^{s} dd ds=\frac12\cdot2\int_{-1}^{1}\mathrm e^{s}ds=\mathrm e-\frac1{\mathrm e} .$$

故
$$I=2(\mathrm e-\frac{1}{\mathrm e}) .$$

@考点
用积分路径的方程化简被积函数；$\oint_L(x dy-y dx)=2S$；二重积分的换元与雅可比行列式；恒等式 $|u|+|v|=\max(|u+v|,|u-v|)$。

易混：对数换元后面积**不是**菱形的面积 $2$，因为雅可比 $\mathrm e^{u+v}$ 不是常数；必须带着权重积分。

@易错
1. 忘记在 $L$ 上分母为 $1$，试图分片处理绝对值。
2. 换元时漏掉雅可比 $\mathrm e^{u+v}$。
3. 把 $S$ 当成菱形面积 $2$，答成 $4$。
4. 第二次换元的雅可比写成 $2$ 而不是 $\frac12$。

[39]
@题目
设随机变量 $X$ 的分布函数 $F(x)=0.3\Phi\!\Big(\dfrac{x-4}{2}\Big)+0.7\Phi\!\Big(\dfrac{x+1}{3}\Big)$，其中 $\Phi(x)$ 为标准正态分布的分布函数，则 $EX=$ ______.

@切入点
$F(x)=0.3\Phi(\frac{x-4}{2})+0.7\Phi(\frac{x+1}{3})$ 是两个正态分布函数的**凸组合**（系数 $0.3+0.7=1$，非负），这样的分布叫**混合分布**。

混合分布的期望有一条直接的规律：
$$F=\sum p_iF_i\Longrightarrow f=\sum p_if_i\Longrightarrow EX=\sum p_i\cdot E_i ,$$
即**期望是各成分期望的加权平均**（权就是混合系数）。这是因为期望是关于密度的线性泛函。

于是只需读出两个成分的均值：
- $\Phi(\frac{x-4}{2})$ 是 $N(4,2^{2})$ 的分布函数，均值 $4$；
- $\Phi(\frac{x+1}{3})$ 是 $N(-1,3^{2})$ 的分布函数，均值 $-1$。

故
$$EX=0.3\times4+0.7\times(-1)=1.2-0.7=0.5 .$$

注意：**方差不能这样简单加权**（还要加上均值差异带来的项），只有期望（以及一般的"期望型"泛函）可以。

@解答
$F(x)$ 是两个正态分布函数的凸组合（$0.3+0.7=1$），即 $X$ 服从混合分布，密度为
$$f(x)=0.3f_1(x)+0.7f_2(x) ,$$
其中 $f_1$ 是 $N(4,2^{2})$ 的密度、$f_2$ 是 $N(-1,3^{2})$ 的密度（由 $\Phi(\frac{x-\mu}{\sigma})$ 的形式读出 $\mu,\sigma$）。

于是
$$EX=\int_{-\infty}^{+\infty}xf(x)dx=0.3\int xf_1dx+0.7\int xf_2dx=0.3\times4+0.7\times(-1)=0.5 .$$

@考点
混合分布（分布函数的凸组合）；由 $\Phi(\frac{x-\mu}{\sigma})$ 读出正态分布的参数；期望对密度的线性性。

易混：混合分布**不是**正态分布；它的期望可按权相加，但方差要用
$$DX=\sum p_i(\sigma_i^{2}+\mu_i^{2})-(\sum p_i\mu_i)^{2} ,$$
不能直接加权。

@易错
1. 把 $\Phi(\frac{x-4}{2})$ 的参数读成 $\mu=4,\sigma^{2}=2$（应是 $\sigma=2$）。
2. 第二项的均值读成 $1$（$\frac{x+1}{3}=\frac{x-(-1)}{3}$，均值是 $-1$）。
3. 把混合当成两个正态之和。
4. 用同样的方式去算方差。

[40]
@题目
设 $V$ 是由曲面 $z=\sqrt{1-x^{2}-y^{2}}$ 与 $z+1=\sqrt{x^{2}+y^{2}}$ 所围成的区域，计算
$$I=\iiint_{V}z^{2}\mathrm{d}V.$$

@切入点
先把两个曲面认清楚：
- $z=\sqrt{1-x^{2}-y^{2}}$ 是**上半球面**（半径 $1$，球心原点）；
- $z+1=\sqrt{x^{2}+y^{2}}$ 即 $z=r-1$ 是**圆锥面**，顶点在 $(0,0,-1)$，向上张开。

交线：令 $\sqrt{1-r^{2}}=r-1$。左端 $\geqslant0$，右端 $\leqslant0$（因 $r\leqslant1$），故只能同时为零，即 $r=1,z=0$。所以两曲面**只在赤道圆相交**，围成的区域是"上面是半球、下面是倒锥"的一个立体。

由于区域绕 $z$ 轴旋转对称、被积函数只含 $z$，用**柱坐标**最自然：
$$0\leqslant\theta\leqslant2\pi,  0\leqslant r\leqslant1,  r-1\leqslant z\leqslant\sqrt{1-r^{2}} .$$
先对 $z$ 积分（被积函数 $z^{2}$，原函数 $\frac{z^{3}}{3}$），再对 $r$ 积分，两个积分都能凑微分。

注意下限 $z=r-1$ 是**负**的（区域有一半在 $xOy$ 面以下），代入 $z^{3}$ 时符号不要丢。

@解答
上半球面 $z=\sqrt{1-x^{2}-y^{2}}$ 与圆锥面 $z=\sqrt{x^{2}+y^{2}}-1$ 的交线：由 $\sqrt{1-r^{2}}=r-1$ 且两端分别非负、非正，得 $r=1$、$z=0$。故区域在柱坐标下为
$$0\leqslant\theta\leqslant2\pi,  0\leqslant r\leqslant1,  r-1\leqslant z\leqslant\sqrt{1-r^{2}} .$$

于是
$$I=\int_{0}^{2\pi}d\theta\int_{0}^{1}r dr\int_{r-1}^{\sqrt{1-r^{2}}}z^{2}dz=2\pi\int_{0}^{1}\frac r3[(1-r^{2})^{\frac32}-(r-1)^{3}]dr .$$

分别计算：
$$\int_{0}^{1}r(1-r^{2})^{\frac32}dr=\frac12\int_{0}^{1}w^{\frac32}dw=\frac12\cdot\frac25=\frac15 (w=1-r^{2}) ,$$
$$\int_{0}^{1}r(r-1)^{3}dr\ \overset{s=r-1}{=}\ \int_{-1}^{0}(s+1)s^{3}ds=[\frac{s^{5}}{5}+\frac{s^{4}}{4}]_{-1}^{0}=-(-\frac15+\frac14)=-\frac1{20} .$$
故
$$I=\frac{2\pi}{3}(\frac15+\frac1{20})=\frac{2\pi}{3}\cdot\frac14=\frac{\pi}{6} .$$

@考点
柱坐标下的三重积分；两曲面交线的求法（注意符号约束）；凑微分与换元积分。

易混：圆锥 $z=\sqrt{x^{2}+y^{2}}-1$ 的顶点在 $(0,0,-1)$ 而不是原点；若写成 $z=\sqrt{x^{2}+y^{2}}$ 就会得到完全不同的区域。

@易错
1. 交线求成 $r=\frac{1}{\sqrt2}$ 之类（没注意到两端的符号约束）。
2. $z$ 的下限写成 $0$（漏掉 $xOy$ 面以下的部分）。
3. $(r-1)^{3}$ 的负号处理错。
4. 忘记柱坐标体积元中的 $r$。

[41]
@题目
曲线
$$L:\begin{cases}x^{2}+y^{2}=10,\\ x^{2}+z^{2}=10\end{cases}$$
在点 $P(3,1,1)$ 处的切线方程为________，法平面方程为________.

@切入点
$L$ 是两个曲面的**交线**，求它的切向量有一条固定路线：
$$\mathbf s=\mathbf n_1\times\mathbf n_2 ,$$
即两个曲面法向量的叉积。理由很直白：切线同时落在两张曲面的切平面内，所以与两个法向量都垂直。

算法向量：
$$F_1=x^{2}+y^{2}-10,  \nabla F_1|_P=(2x,2y,0)|_{(3,1,1)}=(6,2,0) ,$$
$$F_2=x^{2}+z^{2}-10,  \nabla F_2|_P=(2x,0,2z)|_{(3,1,1)}=(6,0,2) .$$
叉积 $(6,2,0)\times(6,0,2)=(4,-12,-12)$，约去公因子 $4$ 得方向 $(1,-3,-3)$——**约简后再写方程会干净很多**。

有了切向量与点：
- 切线：对称式 $\dfrac{x-3}{1}=\dfrac{y-1}{-3}=\dfrac{z-1}{-3}$；
- 法平面：以切向量为法向量的平面，$(x-3)-3(y-1)-3(z-1)=0$。

**记住这组对应关系**：曲线的切向量 $=$ 法平面的法向量；曲面的法向量 $=$ 法线的方向向量。两者角色恰好互换。

@解答
先验证 $P(3,1,1)$ 在 $L$ 上：$9+1=10$，$9+1=10$，成立。

两曲面的法向量：
$$\mathbf n_1=\nabla(x^{2}+y^{2}-10)|_P=(6,2,0),  \mathbf n_2=\nabla(x^{2}+z^{2}-10)|_P=(6,0,2) .$$
切向量
$$\mathbf s=\mathbf n_1\times\mathbf n_2=\begin{vmatrix}\mathbf i&\mathbf j&\mathbf k\\6&2&0\\6&0&2\end{vmatrix}=(4,\ -12,\ -12)\parallel(1,\ -3,\ -3) .$$

**切线方程**：
$$\frac{x-3}{1}=\frac{y-1}{-3}=\frac{z-1}{-3} .$$

**法平面方程**（以 $\mathbf s$ 为法向量过 $P$）：
$$1\cdot(x-3)-3(y-1)-3(z-1)=0\Longrightarrow x-3y-3z+3=0 .$$

@考点
两曲面交线的切向量 $=\mathbf n_1\times\mathbf n_2$；隐式曲面的法向量 $\nabla F$；空间曲线的切线（对称式）与法平面（点法式）。

易混：曲线的**法平面**以切向量为法向量；曲面的**切平面**以法向量为法向量。两个"切"与"法"的搭配不要弄反。

@易错
1. 把两个法向量直接当成切向量。
2. 叉积计算出错（第二个分量带负号）。
3. 不约简方向向量，写出系数很大的方程（不算错但易算错）。
4. 法平面方程漏掉常数项。

[42]
@题目
设 $\displaystyle F(x)=\int_{0}^{x}tf(x^{2}-t^{2})\,\mathrm{d}t$，$f(x)$ 在 $x=0$ 某邻域内可导，且 $f(0)=0$，$f'(0)=1$，则
$$\lim_{x\to 0}\frac{F(x)}{x^{4}}=\underline{\qquad\qquad}$$

@切入点
$F(x)=\displaystyle\int_0^xtf(x^{2}-t^{2})dt$ 的被积函数**含参数 $x$**，不能直接用变限积分求导公式。但注意 $t dt$ 与 $x^{2}-t^{2}$ 的组合：令
$$u=x^{2}-t^{2}\Longrightarrow du=-2t dt\Longrightarrow t dt=-\frac{du}{2} ,$$
恰好把 $t dt$ 整个吸收掉！换元后 $t:0\to x$ 对应 $u:x^{2}\to0$，于是
$$F(x)=\frac12\int_{0}^{x^{2}}f(u)du ,$$
**参数只留在上限**，成了标准的变限积分。这一步换元是全题的关键。

接下来求极限：令 $s=x^{2}\to0^{+}$，
$$\lim_{x\to0}\frac{F(x)}{x^{4}}=\frac12\lim_{s\to0^{+}}\frac{\int_0^sf(u)du}{s^{2}} ,$$
是 $\frac00$ 型，洛必达一次得 $\dfrac{f(s)}{2s}$，再用 $f(0)=0$ 与导数定义
$$\lim_{s\to0}\frac{f(s)}{s}=f'(0)=1 ,$$
得到 $\frac12\cdot\frac12=\frac14$。

（注意题设只给 $f$ **可导**，不一定连续可导，所以第二次不能再用洛必达，要用导数定义。）

@解答
令 $u=x^{2}-t^{2}$，则 $t dt=-\dfrac{du}{2}$，$t:0\to x$ 对应 $u:x^{2}\to0$，故
$$F(x)=\int_{0}^{x}tf(x^{2}-t^{2})dt=-\frac12\int_{x^{2}}^{0}f(u)du=\frac12\int_{0}^{x^{2}}f(u)du .$$

令 $s=x^{2}$（$x\to0$ 时 $s\to0^{+}$），则
$$\lim_{x\to0}\frac{F(x)}{x^{4}}=\frac12\lim_{s\to0^{+}}\frac{\int_{0}^{s}f(u)du}{s^{2}} .$$
这是 $\dfrac00$ 型，由洛必达法则（$f$ 连续）
$$=\frac12\lim_{s\to0^{+}}\frac{f(s)}{2s}=\frac14\lim_{s\to0^{+}}\frac{f(s)-f(0)}{s}=\frac{f'(0)}{4}=\frac14 ,$$
其中用到 $f(0)=0$ 与 $f'(0)=1$。

@考点
被积函数含参数时用换元把参数移到积分限；变限积分与洛必达法则；导数的定义（在只知可导、不知导数连续时代替第二次洛必达）。

易混：$\displaystyle\int_0^xg(x,t)dt$ 型不能直接套 $\frac{d}{dx}\int_0^x g(t)dt=g(x)$；要么换元、要么用含参积分求导公式。

@易错
1. 直接对 $F$ 用变限积分求导公式，忽略被积函数含 $x$。
2. 换元时上下限不反号，丢掉负号。
3. 第二次仍用洛必达（需要 $f'$ 连续，题设未给）。
4. 忘记外面的因子 $\frac12$。

[43]
@题目
设 $A, B$ 均为 $n$ 阶可逆矩阵，且 $AB = B^{-1}A^{-1}$，则 $\mathrm{r}(E+BA) + \mathrm{r}(E-BA) = \underline{\hspace{2cm}}$.

@切入点
条件 $AB=B^{-1}A^{-1}$ 右端正是 $(AB)^{-1}$，所以它等价于
$$(AB)^{2}=E .$$
而本题问的是 $BA$，所以要把这个结论**搬到 $BA$ 上**：由 $BA=B(AB)B^{-1}$（相似），
$$(BA)^{2}=B(AB)^{2}B^{-1}=BEB^{-1}=E .$$

有了 $(BA)^{2}=E$ 就得到关键的**零化等式**
$$(E+BA)(E-BA)=E-(BA)^{2}=O .$$

接下来是"两个秩之和"的标准套路，**上下夹逼**：
- 由 $MN=O$ 得 $\mathrm r(M)+\mathrm r(N)\leqslant n$（西尔维斯特不等式）；
- 由 $\mathrm r(M)+\mathrm r(N)\geqslant\mathrm r(M+N)$ 得 $\geqslant\mathrm r(2E)=n$。

两边一夹，和恰为 $n$。这个"$A^{2}=E$ 型矩阵的两个秩之和等于 $n$"是一个应当记住的结论（它说明 $\mathbb R^{n}$ 分解成 $\lambda=1$ 与 $\lambda=-1$ 两个特征子空间的直和）。

@解答
由 $AB=B^{-1}A^{-1}=(AB)^{-1}$ 得
$$(AB)^{2}=E .$$
又 $BA=B(AB)B^{-1}$，故
$$(BA)^{2}=B(AB)^{2}B^{-1}=BEB^{-1}=E .$$
于是
$$(E+BA)(E-BA)=E-(BA)^{2}=O .$$

**上界**：由 $MN=O\Rightarrow\mathrm r(M)+\mathrm r(N)\leqslant n$，
$$\mathrm r(E+BA)+\mathrm r(E-BA)\leqslant n .$$

**下界**：由 $\mathrm r(M)+\mathrm r(N)\geqslant\mathrm r(M+N)$，
$$\mathrm r(E+BA)+\mathrm r(E-BA)\geqslant\mathrm r[(E+BA)+(E-BA)]=\mathrm r(2E)=n .$$

故
$$\mathrm r(E+BA)+\mathrm r(E-BA)=n .$$

@考点
$(AB)^{-1}=B^{-1}A^{-1}$；$AB$ 与 $BA$ 相似（$A$ 或 $B$ 可逆时）；由 $MN=O$ 得 $\mathrm r(M)+\mathrm r(N)\leqslant n$；秩的次可加性 $\mathrm r(M+N)\leqslant\mathrm r(M)+\mathrm r(N)$；对合矩阵（$M^{2}=E$）的秩分解。

易混：$\mathrm r(M)+\mathrm r(N)\leqslant n$ 的前提是 $MN=O$；$\mathrm r(M+N)\leqslant\mathrm r(M)+\mathrm r(N)$ 则无条件成立。两条一上一下才能夹出等号。

@易错
1. 只证上界或只证下界。
2. 由 $(AB)^{2}=E$ 直接说 $(BA)^{2}=E$ 而不给理由。
3. 把 $\mathrm r(2E)$ 写成 $2n$。
4. 误以为 $BA=AB$。

[44]
@题目
一动点 $P$ 在曲线 $9y=4x^{2}$ 上运动，已知点 $P$ 横坐标变化速率为 $30\ \mathrm{cm}/\mathrm{s}$，问：当点 $P$ 经过 $(3,4)$ 时，从原点到点 $P$ 的距离 $S$ 的变化速率为多少？（设坐标轴的单位长为 $1\ \mathrm{cm}$）

@切入点
这是**相关变化率**问题，套路固定：
1. 写出各量之间的**关系式**；
2. 两边对**时间 $t$** 求导（每个变量都是 $t$ 的函数，链式法则）；
3. 代入某一时刻的数值。

本题的关系式有两个：
$$9y=4x^{2} (\text{点在曲线上}),  S=\sqrt{x^{2}+y^{2}} (\text{距离}) .$$

对 $t$ 求导：
$$9\frac{dy}{dt}=8x\frac{dx}{dt},  \frac{dS}{dt}=\frac{x\frac{dx}{dt}+y\frac{dy}{dt}}{\sqrt{x^{2}+y^{2}}} .$$
（第二式由 $S^{2}=x^{2}+y^{2}$ 两边求导 $2S\frac{dS}{dt}=2x\frac{dx}{dt}+2y\frac{dy}{dt}$ 得到，比直接对根号求导更省事。）

代入 $x=3$、$y=4$、$\frac{dx}{dt}=30$：先由第一式算出 $\frac{dy}{dt}=80$，再代入第二式（此时 $S=5$）得 $\frac{dS}{dt}=82$。

**顺序很重要**：必须先求 $\frac{dy}{dt}$，因为它出现在第二式里。

@解答
由 $9y=4x^{2}$ 两边对 $t$ 求导：
$$9\frac{dy}{dt}=8x\frac{dx}{dt}\Longrightarrow \frac{dy}{dt}=\frac{8x}{9}\frac{dx}{dt} .$$
在点 $(3,4)$ 处（$x=3$，$\dfrac{dx}{dt}=30$）：
$$\frac{dy}{dt}=\frac{8\times3}{9}\times30=\frac{8}{3}\times30=80\ (\mathrm{cm/s}) .$$

由 $S^{2}=x^{2}+y^{2}$ 两边对 $t$ 求导：
$$2S\frac{dS}{dt}=2x\frac{dx}{dt}+2y\frac{dy}{dt}\Longrightarrow \frac{dS}{dt}=\frac{x\frac{dx}{dt}+y\frac{dy}{dt}}{S} .$$
在 $(3,4)$ 处 $S=\sqrt{9+16}=5$，故
$$\frac{dS}{dt}=\frac{3\times30+4\times80}{5}=\frac{90+320}{5}=82\ (\mathrm{cm/s}) .$$

即距离 $S$ 的变化速率为 $82$ cm/s。

@考点
相关变化率（隐含时间变量的链式求导）；对 $S^{2}=x^{2}+y^{2}$ 求导比对 $S=\sqrt{\cdot}$ 求导更简便；单位的处理。

易混：$\frac{dy}{dx}$（曲线的斜率）与 $\frac{dy}{dt}$（$y$ 随时间的变化率）不同，两者相差一个 $\frac{dx}{dt}$。

@易错
1. 忘记 $x,y$ 都是 $t$ 的函数，求导时漏掉 $\frac{dx}{dt}$。
2. 先算 $\frac{dS}{dt}$ 却还没求出 $\frac{dy}{dt}$。
3. $S$ 的值算错（$(3,4)$ 到原点距离是 $5$）。
4. 答案漏写单位。

[45]
@题目
设 $F(x,y)$ 在点 $(x_0,y_0)$ 的某邻域内有二阶连续偏导数，且 $F(x_0,y_0)=0$，$F'_x(x_0,y_0)=0$，$F'_y(x_0,y_0)>0$，$F''_{xx}(x_0,y_0)<0$，则由方程 $F(x,y)=0$ 确定的隐函数 $y=y(x)$ 在 $x=x_0$ 处（　）.
A. 取得极小值　　B. 取得极大值　　C. 不取得极值　　D. 不能确定是否取得极值

@切入点
要判断隐函数 $y=y(x)$ 在 $x_0$ 处的极值，只需两件事：**一阶导为零**（驻点）与**二阶导的符号**。所以把隐函数求导公式用两次即可，全程不需要知道 $F$ 的具体形状。

一阶：由 $F(x,y(x))=0$ 求导得 $F'_x+F'_yy'=0$，故
$$y'=-\frac{F'_x}{F'_y} .$$
在 $(x_0,y_0)$ 处 $F'_x=0$、$F'_y>0$，得 $y'(x_0)=0$——确实是驻点。（顺带一提，$F'_y\neq0$ 正是隐函数存在定理的条件，题目给 $F'_y>0$ 同时保证了隐函数存在。）

二阶：对 $F'_x+F'_yy'=0$ 再求一次导：
$$F''_{xx}+2F''_{xy}y'+F''_{yy}(y')^{2}+F'_yy''=0 .$$
**在 $x_0$ 处 $y'=0$**，所以含 $y'$ 的项全部消失，只剩
$$F''_{xx}+F'_yy''=0\Longrightarrow y''(x_0)=-\frac{F''_{xx}(x_0,y_0)}{F'_y(x_0,y_0)} .$$
代入符号：$F''_{xx}<0$、$F'_y>0$ 给出 $y''(x_0)>0$，故取**极小值**。

关键技巧是"**先代 $y'(x_0)=0$ 再看二阶式**"，这样一大堆混合项自动消掉。

@解答
由 $F(x,y(x))\equiv0$ 两边对 $x$ 求导：
$$F'_x+F'_y y'=0 .$$
在 $(x_0,y_0)$ 处 $F'_x=0$，$F'_y>0$，故
$$y'(x_0)=-\frac{F'_x(x_0,y_0)}{F'_y(x_0,y_0)}=0 ,$$
即 $x_0$ 是驻点。

再对 $F'_x+F'_yy'=0$ 求导：
$$F''_{xx}+2F''_{xy}y'+F''_{yy}(y')^{2}+F'_y y''=0 .$$
在 $x=x_0$ 处代入 $y'(x_0)=0$：
$$F''_{xx}(x_0,y_0)+F'_y(x_0,y_0) y''(x_0)=0\Longrightarrow y''(x_0)=-\frac{F''_{xx}(x_0,y_0)}{F'_y(x_0,y_0)} .$$
由 $F''_{xx}(x_0,y_0)<0$、$F'_y(x_0,y_0)>0$ 得 $y''(x_0)>0$。

故 $y(x)$ 在 $x=x_0$ 处取得**极小值**，选 **A**。

@考点
隐函数存在定理与求导公式 $y'=-\frac{F'_x}{F'_y}$；二阶隐函数导数；极值的第二充分条件（$y'=0$ 且 $y''>0$ 取极小）。

易混：$y''$ 的公式在一般点上很复杂，但在**驻点**（$y'=0$）处大幅简化为 $-\frac{F''_{xx}}{F'_y}$；这个简化只在驻点成立。

@易错
1. 求二阶导时忘记 $y'$ 也是 $x$ 的函数，漏掉 $F'_y y''$ 项。
2. 不先代 $y'(x_0)=0$，被混合项淹没。
3. 符号弄反，判成极大值。
4. 忽略 $F'_y\neq0$ 是隐函数存在的前提。

[46]
@题目
设球面为 $x^2+y^2+z^2=R^2$，柱面为 $x^2+y^2=Rx\ (R>0)$，球面在柱体内的面积为 $S_1$，柱面在球体内的面积为 $S_2$，求 $\dfrac{S_1}{S_2}$．

@切入点
这道题是经典的"**维维安尼**"配置：球面 $x^{2}+y^{2}+z^{2}=R^{2}$ 与柱面 $x^{2}+y^{2}=Rx$（底圆半径 $\frac R2$、过原点）。两块面积的算法完全不同，要分开对待。

**$S_1$（球面在柱体内的部分）**：这是**可以投影到 $xOy$ 面**的曲面，用
$$dS=\sqrt{1+z_x^{2}+z_y^{2}} dxdy=\frac{R}{\sqrt{R^{2}-x^{2}-y^{2}}}dxdy ,$$
投影区域是圆 $r\leqslant R\cos\theta$（$|\theta|\leqslant\frac\pi2$），上下两块对称故乘 $2$。极坐标下内层积分 $\int\frac{r dr}{\sqrt{R^{2}-r^{2}}}$ 是凑微分，结果出现 $|\sin\theta|$，**绝对值不能丢**。

**$S_2$（柱面在球体内的部分）**：柱面是竖直的，**不能投影到 $xOy$ 面**（投影退化成曲线），必须用柱面自身的参数。把底圆参数化为
$$x=\frac R2(1+\cos\varphi),  y=\frac R2\sin\varphi ,$$
则弧长元 $ds=\frac R2d\varphi$，面积元 $dS=ds dz$。在球内的高度范围由
$$z^{2}\leqslant R^{2}-(x^{2}+y^{2})=R^{2}-Rx=R^{2}\sin^{2}\frac\varphi2$$
给出（这一步用半角公式化简得非常干净），故高度为 $2R|\sin\frac\varphi2|$。积分一次即得 $S_2=4R^{2}$——一个**不含 $\pi$** 的漂亮结果。

@解答
**求 $S_1$**：上半球面 $z=\sqrt{R^{2}-x^{2}-y^{2}}$，
$$dS=\frac{R}{\sqrt{R^{2}-x^{2}-y^{2}}}dxdy ,$$
投影区域为 $x^{2}+y^{2}\leqslant Rx$，即极坐标下 $0\leqslant r\leqslant R\cos\theta$，$-\dfrac\pi2\leqslant\theta\leqslant\dfrac\pi2$。上下对称，故
$$S_1=2\int_{-\frac\pi2}^{\frac\pi2}\int_{0}^{R\cos\theta}\frac{Rr}{\sqrt{R^{2}-r^{2}}}drd\theta .$$
内层
$$\int_{0}^{R\cos\theta}\frac{Rr dr}{\sqrt{R^{2}-r^{2}}}=R[-\sqrt{R^{2}-r^{2}}]_{0}^{R\cos\theta}=R(R-R|\sin\theta|)=R^{2}(1-|\sin\theta|) ,$$
故
$$S_1=2R^{2}\int_{-\frac\pi2}^{\frac\pi2}(1-|\sin\theta|)d\theta=2R^{2}(\pi-2) .$$

**求 $S_2$**：柱面底圆参数化 $x=\dfrac R2(1+\cos\varphi)$，$y=\dfrac R2\sin\varphi$（$0\leqslant\varphi\leqslant2\pi$），弧长元 $ds=\dfrac R2d\varphi$。在球内要求
$$z^{2}\leqslant R^{2}-(x^{2}+y^{2})=R^{2}-Rx=R^{2}-\frac{R^{2}}{2}(1+\cos\varphi)=R^{2}\cdot\frac{1-\cos\varphi}{2}=R^{2}\sin^{2}\frac\varphi2 ,$$
即 $|z|\leqslant R|\sin\frac\varphi2|$，高度为 $2R\sin\dfrac\varphi2$（$0\leqslant\varphi\leqslant2\pi$ 时非负）。故
$$S_2=\int_{0}^{2\pi}2R\sin\frac\varphi2\cdot\frac R2d\varphi=R^{2}\int_{0}^{2\pi}\sin\frac\varphi2d\varphi=R^{2}[-2\cos\frac\varphi2]_{0}^{2\pi}=4R^{2} .$$

因此
$$\frac{S_1}{S_2}=\frac{2R^{2}(\pi-2)}{4R^{2}}=\frac{\pi-2}{2} .$$

@考点
曲面面积公式 $dS=\sqrt{1+z_x^{2}+z_y^{2}}dxdy$（可投影曲面）；柱面用"弧长 $\times$ 高"计算面积；圆 $x^{2}+y^{2}=Rx$ 的极坐标方程与参数化；半角公式 $1-\cos\varphi=2\sin^{2}\frac\varphi2$。

易混：竖直柱面在 $xOy$ 面上的投影是一条曲线（零面积），**不能**用投影法求面积；必须用 $dS=ds dz$。

@易错
1. $S_1$ 中丢掉绝对值，把 $\int|\sin\theta|$ 当成 $\int\sin\theta=0$。
2. $S_1$ 忘记上下两块要乘 $2$。
3. $S_2$ 用投影法。
4. $S_2$ 的高度写成 $R|\sin\frac\varphi2|$（少了因子 $2$）。

[47]
@题目
设二次型 $f(x_1,x_2,x_3)=x_1^2+x_2^2+x_3^2-4x_1x_2-4x_1x_3-4x_2x_3$，则 $f(x_1,x_2,x_3)=1$ 在空间直角坐标系下表示的二次曲面为（　　）.
A. 椭球面　B. 柱面　C. 单叶双曲面　D. 双叶双曲面

@切入点
判断 $f=1$ 表示什么二次曲面，只需知道 $f$ 化成标准形后**平方项的正负个数**：
- 三正：椭球面；
- 两正一负：单叶双曲面；
- 一正两负：双叶双曲面；
- 有零系数：柱面（或退化）。

所以问题归结为求 $A$ 的特征值符号。本题的矩阵
$$A=\begin{pmatrix}1&-2&-2\\-2&1&-2\\-2&-2&1\end{pmatrix}$$
有极强的结构：所有对角元相同、所有非对角元相同，即
$$A=3E-2J ,$$
其中 $J$ 是全 $1$ 矩阵。而 $J$ 的特征值是 $3$（对应 $(1,1,1)^{\mathrm T}$）与 $0$（二重），于是 $A$ 的特征值为
$$3-2\cdot3=-3 (\text{一重}),  3-2\cdot0=3 (\text{二重}) .$$
**"$aE+bJ$"型矩阵的特征值秒算**，是处理这类对称系数二次型的利器。

两正一负，故 $f=1$ 即 $3y_1^{2}+3y_2^{2}-3y_3^{2}=1$，是**单叶双曲面**。

@解答
二次型的矩阵为
$$A=\begin{pmatrix}1&-2&-2\\-2&1&-2\\-2&-2&1\end{pmatrix}=3E-2J ,$$
其中 $J$ 为全 $1$ 矩阵。$J$ 的特征值为 $3$（一重，特征向量 $(1,1,1)^{\mathrm T}$）与 $0$（二重），故 $A$ 的特征值为
$$3-2\times3=-3,  3-2\times0=3\ (\text{二重}) .$$

由正交变换化标准形得
$$f=3y_1^{2}+3y_2^{2}-3y_3^{2} ,$$
故 $f=1$ 即
$$3y_1^{2}+3y_2^{2}-3y_3^{2}=1 ,$$
两个正项、一个负项，表示**单叶双曲面**。

选 **C**。

@考点
二次型的矩阵与特征值；正交变换化标准形（保持几何形状）；由标准形系数的正负判别二次曲面类型；$aE+bJ$ 型矩阵的特征值。

易混：单叶双曲面（两正一负，连通，形如"腰鼓"）与双叶双曲面（一正两负，分两片）；判别只看正负个数。

@易错
1. 二次型矩阵的非对角元忘记除以 $2$（$-4x_1x_2$ 对应 $a_{12}=-2$）。
2. 特征值算错符号。
3. 把两正一负判成双叶双曲面。
4. 用正交变换以外的可逆变换（会改变几何形状，不能用于判别曲面类型）。

[48]
@题目
设总体 $X$ 与总体 $Y$ 相互独立，且都服从 $N(\mu,\sigma^2)$，$\overline{X}$ 与 $\overline{Y}$ 分别为来自总体 $X$、$Y$ 的样本均值，样本容量均为 $n$，则当 $n$ 固定时，$P\{|\overline{X} - \overline{Y}| > \sigma\}$ 的值随着 $\sigma$ 的增大（　）。
A. 单调增加　　B. 单调减少　　C. 保持不变　　D. 增减性不确定

@切入点
问的是"概率随 $\sigma$ 增大如何变化"，所以要把概率**算成 $\sigma$ 的表达式**再看。

第一步：$\overline X$ 与 $\overline Y$ 独立，各服从 $N(\mu,\frac{\sigma^{2}}{n})$，故
$$\overline X-\overline Y\sim N(0,\ \frac{2\sigma^{2}}{n}) $$
（均值相减、方差**相加**）。

第二步：标准化。令 $Z=\dfrac{\overline X-\overline Y}{\sqrt{2\sigma^{2}/n}}\sim N(0,1)$，则
$$P\{|\overline X-\overline Y|>\sigma\}=P\{|Z|>\frac{\sigma}{\sqrt{2\sigma^{2}/n}}\}=P\{|Z|>\sqrt{\frac n2}\} .$$

**$\sigma$ 被彻底约掉了**！因为门槛 $\sigma$ 与标准差 $\sigma\sqrt{2/n}$ 是同比例缩放的，标准化后只剩 $\sqrt{n/2}$。所以概率与 $\sigma$ 无关，选 C。

这道题的教育意义：**当"阈值"与"标准差"成正比时，概率是尺度不变的**；题目把阈值恰好取成 $\sigma$ 就是为了制造这个效果。

@解答
因 $X,Y$ 独立同服从 $N(\mu,\sigma^{2})$，两组样本独立，故
$$\overline X\sim N(\mu,\frac{\sigma^{2}}{n}),  \overline Y\sim N(\mu,\frac{\sigma^{2}}{n}) ,$$
且相互独立，于是
$$\overline X-\overline Y\sim N(0,\ \frac{\sigma^{2}}{n}+\frac{\sigma^{2}}{n})=N(0,\ \frac{2\sigma^{2}}{n}) .$$
标准化：记 $Z=\dfrac{\overline X-\overline Y}{\sigma\sqrt{2/n}}\sim N(0,1)$，则
$$P\{|\overline X-\overline Y|>\sigma\}=P\{|Z|>\frac{\sigma}{\sigma\sqrt{2/n}}\}=P\{|Z|>\sqrt{\frac n2}\}=2[1-\Phi(\sqrt{\frac n2})] .$$
该值只依赖于 $n$，与 $\sigma$ 无关。故当 $n$ 固定时概率**保持不变**。

选 **C**。

@考点
样本均值的分布 $\overline X\sim N(\mu,\frac{\sigma^{2}}{n})$；独立正态之差仍正态且方差相加；标准化；正态分布的尺度不变性。

易混：$D(\overline X-\overline Y)=\frac{2\sigma^{2}}{n}$，是两个方差**相加**；若写成相减会得到 $0$。

@易错
1. 方差算成 $\frac{\sigma^{2}}{n}$ 或 $0$。
2. 标准化时分母忘记开方或漏掉 $\sqrt{2/n}$。
3. 凭直觉认为"$\sigma$ 增大则波动大，概率增大"而选 A（忽略阈值也在同步增大）。
4. 把 $n$ 与 $\sigma$ 的角色弄混。

[49]
@题目
设平面 $\pi$ 与点 $P(1,2,1)$ 的距离为 $1$，且过直线
$$L:\begin{cases}3x-2y+2=0,\\ x-2y-z+6=0,\end{cases}$$
求平面 $\pi$ 的方程.

@切入点
"过定直线的平面"这个条件，用**平面束**表示最省事：若直线是两个平面 $\pi_1:A_1=0$ 与 $\pi_2:A_2=0$ 的交线，则过该直线的平面（除 $\pi_2$ 本身外）都可写成
$$A_1+\lambda A_2=0 .$$
这样只剩一个待定参数 $\lambda$，再用"距离为 $1$"这一个条件就能定出来。

本题
$$\pi:\ (3x-2y+2)+\lambda(x-2y-z+6)=0 ,$$
整理得
$$(3+\lambda)x-(2+2\lambda)y-\lambda z+(2+6\lambda)=0 .$$
点到平面的距离公式给出
$$\frac{|(3+\lambda)-2(2+2\lambda)-\lambda+(2+6\lambda)|}{\sqrt{(3+\lambda)^{2}+(2+2\lambda)^{2}+\lambda^{2}}}=\frac{|1+2\lambda|}{\sqrt{6\lambda^{2}+14\lambda+13}}=1 ,$$
平方去绝对值得到 $\lambda$ 的二次方程，**两个根对应两个平面**——这类题答案通常不止一个，别只写一个。

最后别忘了**检查平面束遗漏的那一个**：$\pi_2:x-2y-z+6=0$ 本身不在束中（对应 $\lambda\to\infty$），要单独验算它到 $P$ 的距离是否为 $1$（本题不是，故排除）。

@解答
设所求平面属于过 $L$ 的平面束：
$$(3x-2y+2)+\lambda(x-2y-z+6)=0 ,$$
即
$$(3+\lambda)x-(2+2\lambda)y-\lambda z+(2+6\lambda)=0 .$$

点 $P(1,2,1)$ 到该平面的距离：
$$\frac{|(3+\lambda)\cdot1-(2+2\lambda)\cdot2-\lambda\cdot1+(2+6\lambda)|}{\sqrt{(3+\lambda)^{2}+(2+2\lambda)^{2}+\lambda^{2}}}=\frac{|1+2\lambda|}{\sqrt{6\lambda^{2}+14\lambda+13}}=1 .$$
两边平方：
$$(1+2\lambda)^{2}=6\lambda^{2}+14\lambda+13\Longrightarrow 4\lambda^{2}+4\lambda+1=6\lambda^{2}+14\lambda+13 ,$$
$$2\lambda^{2}+10\lambda+12=0\Longrightarrow \lambda^{2}+5\lambda+6=0\Longrightarrow \lambda=-2\ \text{或}\ \lambda=-3 .$$

$\lambda=-2$：$x+2y+2z-10=0$；
$\lambda=-3$：$4y+3z-16=0$。

另需检验平面束中未包含的平面 $x-2y-z+6=0$：$P$ 到它的距离为 $\dfrac{|1-4-1+6|}{\sqrt6}=\dfrac{2}{\sqrt6}\neq1$，不合题意。

故所求平面为
$$x+2y+2z-10=0 \text{或}  4y+3z-16=0 .$$

@考点
过定直线的平面束方程；点到平面的距离公式；平面束不含其中一个平面（需单独检验）。

易混：平面束 $A_1+\lambda A_2=0$ 中 $\lambda$ 取遍实数得到除 $\pi_2$ 外的所有过 $L$ 的平面；漏检 $\pi_2$ 是常见失分点（虽然本题它恰好不符合）。

@易错
1. 只解出一个 $\lambda$。
2. 距离公式的分子代入时算错（注意 $y$ 的系数是 $-(2+2\lambda)$，要乘 $2$）。
3. 分母展开出错（$6\lambda^{2}+14\lambda+13$）。
4. 忘记检验 $\pi_2$。

[50]
@题目
设随机变量 $X$ 在 $(0,1)$ 内服从均匀分布，求 $Y=-2\ln X$ 的概率密度.

@切入点
$Y=-2\ln X$，其中 $X\sim U(0,1)$。先定**取值范围**：$X\in(0,1)\Rightarrow\ln X<0\Rightarrow Y>0$。

$g(x)=-2\ln x$ 在 $(0,1)$ 上严格单调**减**（$\ln$ 递增，乘 $-2$ 反向），所以用分布函数法时不等号要反向：
$$F_Y(y)=P\{-2\ln X\leqslant y\}=P\{\ln X\geqslant-\frac y2\}=P\{X\geqslant\mathrm e^{-\frac y2}\} .$$
注意 $y>0$ 时 $\mathrm e^{-y/2}\in(0,1)$，落在 $X$ 的取值范围内，故
$$F_Y(y)=1-\mathrm e^{-\frac y2} ,$$
（用了 $F_X(x)=x$ 在 $(0,1)$ 上）。

求导得 $f_Y(y)=\dfrac12\mathrm e^{-y/2}$（$y>0$），**恰是参数为 $\frac12$ 的指数分布**。

这是一个应当记住的结论：**均匀分布取 $-\lambda^{-1}\ln$ 就变成指数分布**（这正是计算机生成指数随机数的方法）。

@解答
$X\sim U(0,1)$，$F_X(x)=x$（$0<x<1$）。因 $0<X<1$，$\ln X<0$，故 $Y=-2\ln X>0$。

当 $y\leqslant0$ 时 $F_Y(y)=0$。当 $y>0$ 时（此时 $\mathrm e^{-y/2}\in(0,1)$）：
$$F_Y(y)=P\{-2\ln X\leqslant y\}=P\{\ln X\geqslant-\frac y2\}=P\{X\geqslant\mathrm e^{-\frac y2}\}=1-\mathrm e^{-\frac y2} .$$
求导得
$$f_Y(y)=\begin{cases}\dfrac12\mathrm e^{-\frac y2},&y>0,\\[4pt] 0,&y\leqslant0 ,\end{cases}$$
即 $Y$ 服从参数为 $\dfrac12$ 的指数分布。

@考点
随机变量函数的分布（分布函数法）；单调减变换时不等号反向；均匀分布与指数分布的关系（概率积分变换）。

易混：$\ln X\geqslant-\frac y2$ 化为 $X\geqslant\mathrm e^{-y/2}$ 时不等号**不**反向（$\mathrm e^{u}$ 递增）；只有乘 $-2$ 那一步反向。两步要分清。

@易错
1. 不等号方向弄错，得到 $F_Y=\mathrm e^{-y/2}$（它递减，不可能是分布函数）。
2. 忘记 $Y>0$，给出对一切 $y$ 的表达式。
3. 求导时漏掉 $\frac12$。
4. 把参数写成 $2$（指数分布 $\lambda=\frac12$，均值为 $2$）。

[51]
@题目
讨论函数
$$f(x)=\lim_{n\to\infty}\frac{x^{n+2}-x^{-n}}{x^{n}+x^{-n}}$$
的连续性.

@切入点
先把 $f(x)$ **算出来**——它是一个含参极限定义的函数，必须按 $|x|$ 与 $1$ 的大小分类。

化简的第一步是**分子分母同乘 $x^{n}$**（消去负指数）：
$$f(x)=\lim_{n\to\infty}\frac{x^{2n+2}-1}{x^{2n}+1} .$$
现在只依赖于 $x^{2n}$ 的极限：
- $|x|>1$：$x^{2n}\to+\infty$，分子分母同除 $x^{2n}$ 得 $\to x^{2}$；
- $|x|<1$（且 $x\neq0$）：$x^{2n}\to0$，得 $\dfrac{0-1}{0+1}=-1$；
- $x=\pm1$：$x^{2n}=1$，得 $\dfrac{1-1}{1+1}=0$；
- $x=0$：原式中 $x^{-n}$ 无意义，$f$ **在 $0$ 处没有定义**。

于是
$$f(x)=\begin{cases}x^{2},&|x|>1,\\ 0,&x=\pm1,\\ -1,&0<|x|<1 .\end{cases}$$

再逐点讨论连续性：在每个开区间内 $f$ 是初等函数，连续；只需检查三个特殊点 $x=\pm1$ 与 $x=0$：
- $x=1$：左极限 $-1$、右极限 $1$，**跳跃间断点**；$x=-1$ 同理（左极限 $1$、右极限 $-1$）；
- $x=0$：$f$ 无定义但两侧极限都是 $-1$，**可去间断点**。

@解答
分子分母同乘 $x^{n}$（$x\neq0$）：
$$f(x)=\lim_{n\to\infty}\frac{x^{2n+2}-1}{x^{2n}+1} .$$

当 $|x|>1$ 时 $x^{2n}\to+\infty$，同除 $x^{2n}$ 得
$$f(x)=\lim_{n\to\infty}\frac{x^{2}-x^{-2n}}{1+x^{-2n}}=x^{2} ;$$
当 $0<|x|<1$ 时 $x^{2n}\to0$，得 $f(x)=\dfrac{-1}{1}=-1$；
当 $x=\pm1$ 时 $x^{2n}=1$，得 $f(x)=\dfrac{1-1}{1+1}=0$；
当 $x=0$ 时 $x^{-n}$ 无意义，$f$ 在 $x=0$ 处无定义。

即
$$f(x)=\begin{cases}x^{2},&|x|>1,\\ 0,&x=\pm1,\\ -1,&0<|x|<1 .\end{cases}$$

**连续性讨论**：

在 $(-\infty,-1)$、$(-1,0)$、$(0,1)$、$(1,+\infty)$ 内 $f$ 分别等于初等函数，连续。

$x=1$：$f(1^{-})=-1$，$f(1^{+})=1$，左右极限存在但不相等，是**跳跃间断点**；
$x=-1$：$f(-1^{-})=1$，$f(-1^{+})=-1$，也是**跳跃间断点**；
$x=0$：$f$ 在此无定义，而 $\lim\limits_{x\to0}f(x)=-1$ 存在，是**可去间断点**。

@考点
含参极限定义的分段函数；$x^{2n}$ 在 $|x|$ 与 $1$ 的三种关系下的极限；间断点的分类。

易混：$x=\pm1$ 处 $f$ **有定义**（值为 $0$）但两侧极限不等，是跳跃间断点；$x=0$ 处 $f$ **无定义**但极限存在，是可去间断点。两类要分清。

@易错
1. 忘记 $x=0$ 处原式无意义。
2. $x=\pm1$ 处直接代入原式的某一支，得到 $1$ 或 $-1$。
3. 漏掉 $|x|>1$ 时的 $x^{2}$（只讨论 $|x|<1$）。
4. 把 $x=\pm1$ 判成可去间断点。

[52]
@题目
设向量组
$$\alpha_{1} = (1,1,1,2)^{\mathrm{T}},\quad \alpha_{2} = (3,a+4,2a+5,a+7)^{\mathrm{T}},\quad \alpha_{3} = (4,6,8,10)^{\mathrm{T}},$$
$$\alpha_{4} = (2,3,2a+3,5)^{\mathrm{T}},\quad \alpha = (0,1,3,b)^{\mathrm{T}}.$$
（Ⅰ）求向量组 $\alpha_{1},\alpha_{2},\alpha_{3},\alpha_{4}$ 的秩及其一个极大线性无关组；
（Ⅱ）若 $\alpha$ 不能由 $\alpha_{1},\alpha_{2},\alpha_{3},\alpha_{4}$ 线性表示，求 $a,b$ 的取值.

@切入点
（Ⅰ）（Ⅱ）都由**同一个初等行变换**解决：把 $(\alpha_1,\alpha_2,\alpha_3,\alpha_4\mid\alpha)$ 化成阶梯形，前四列的阶梯形回答（Ⅰ），整个增广矩阵回答（Ⅱ）。所以一次化简、两问通吃。

化简后得
$$\begin{pmatrix}1&3&4&2&0\\0&a+1&2&1&1\\0&0&0&2a-1&1\\0&0&0&0&b-1\end{pmatrix} .$$
注意第三行的前三个元素**全为零**（第 $3$ 列在消元中被彻底消掉了），这决定了极大无关组里不含 $\alpha_3$（除非 $a=-1$ 使第二行的主元跑到第 $3$ 列）。

（Ⅰ）按 $2a-1$ 是否为零分类：
- $a\neq\frac12$：秩为 $3$，主元在第 $1,2,4$ 列（若 $a=-1$ 则第二行主元在第 $3$ 列，改取 $\alpha_1,\alpha_3,\alpha_4$）；
- $a=\frac12$：第三行变成零行，秩为 $2$，极大无关组 $\alpha_1,\alpha_2$。

（Ⅱ）"不能线性表示"就是方程组**无解**，即出现"$0=$ 非零"的行。可能有两处：
- 第四行 $0=b-1$，故 $b\neq1$ 时必无解（对任意 $a$）；
- 第三行 $0\cdot x_4=1$（当 $2a-1=0$ 时），故 $a=\frac12$ 时必无解（对任意 $b$）。

两种情形取并集即可。

@解答
对 $(\alpha_1,\alpha_2,\alpha_3,\alpha_4\mid\alpha)$ 作初等行变换：
$$\begin{pmatrix}1&3&4&2&0\\1&a+4&6&3&1\\1&2a+5&8&2a+3&3\\2&a+7&10&5&b\end{pmatrix}
\longrightarrow\begin{pmatrix}1&3&4&2&0\\0&a+1&2&1&1\\0&0&0&2a-1&1\\0&0&0&0&b-1\end{pmatrix}.$$

**（Ⅰ）** 只看前四列：

当 $a\neq\dfrac12$ 时，三个非零行的主元分别在第 $1$ 列、第 $2$ 列（$a\neq-1$ 时）或第 $3$ 列（$a=-1$ 时）、第 $4$ 列，故
$$\mathrm r(\alpha_1,\alpha_2,\alpha_3,\alpha_4)=3 ,$$
极大线性无关组为 $\alpha_1,\alpha_2,\alpha_4$（当 $a=-1$ 时取 $\alpha_1,\alpha_3,\alpha_4$）。

当 $a=\dfrac12$ 时第三行为零行，
$$\mathrm r(\alpha_1,\alpha_2,\alpha_3,\alpha_4)=2 ,$$
极大线性无关组为 $\alpha_1,\alpha_2$。

**（Ⅱ）** $\alpha$ 不能由 $\alpha_1,\alpha_2,\alpha_3,\alpha_4$ 线性表示 $\Longleftrightarrow$ 方程组无解 $\Longleftrightarrow$ 阶梯形中出现"$0=$ 非零"：

- 第四行给出 $0=b-1$：当 $b\neq1$ 时无解（对任意 $a$）；
- 第三行给出 $(2a-1)x_4=1$：当 $a=\dfrac12$ 时成为 $0=1$，无解（对任意 $b$）。

故 $\alpha$ 不能被线性表示的条件是
$$b\neq1 \text{或}  a=\frac12 .$$

@考点
用初等行变换同时求秩、极大无关组与判断线性表示；阶梯形中主元列即极大无关组对应的列；方程组无解的判据（出现矛盾行）。

易混：极大无关组要取**主元所在列**对应的原向量；参数变化会改变主元的位置（本题 $a=-1$ 时主元从第 $2$ 列移到第 $3$ 列），必须分类讨论。

@易错
1. 行变换算错（注意第三行要减去第二行的 $2$ 倍）。
2. （Ⅰ）漏掉 $a=-1$ 的特殊情形。
3. （Ⅱ）只考虑 $b\neq1$，漏掉 $a=\frac12$。
4. 把"不能表示"的条件写成"且"而不是"或"。

[53]
@题目
将下列函数展开为 $x$ 的幂级数，并确定收敛域：
（Ⅰ）$f_1(x) = \dfrac{1}{x^2 - 3x + 2}$；
（Ⅱ）$f_2(x) = \ln(1 - x - 2x^2)$；
（Ⅲ）$f_3(x) = \ln(x + \sqrt{1 + x^2})$；
（Ⅳ）$f_4(x) = x \arctan x - \ln\sqrt{1 + x^2}$.

@切入点
四个小题都是"化归到四个基本展开式"，套路各异但目标一致：

**（Ⅰ）有理函数** $\to$ **部分分式 $+$ 几何级数**。$x^{2}-3x+2=(x-1)(x-2)$，拆成 $\frac{1}{1-x}$ 与 $\frac{1}{2-x}$ 两块，各自凑成 $\frac{1}{1-u}$。收敛域取两块的交集，由离原点最近的奇点 $x=1$ 决定。

**（Ⅱ）对数 $+$ 可因式分解** $\to$ **拆成两个 $\ln$**。$1-x-2x^{2}=(1-2x)(1+x)$，于是 $\ln(1-x-2x^{2})=\ln(1-2x)+\ln(1+x)$，两块都用 $\ln(1+u)$ 的展开。端点要分别验：$\ln(1-2x)$ 给出 $-\frac12\leqslant x<\frac12$，$\ln(1+x)$ 给出 $-1<x\leqslant1$，交集 $[-\frac12,\frac12)$。

**（Ⅲ）$\ln(x+\sqrt{1+x^{2}})$** $\to$ **先求导再展开再积分**。它的导数是 $\frac{1}{\sqrt{1+x^{2}}}=(1+x^{2})^{-1/2}$，用二项展开
$$(1+u)^{-\frac12}=\sum_{n=0}^{\infty}\frac{(-1)^{n}(2n)!}{4^{n}(n!)^{2}}u^{n} ,$$
取 $u=x^{2}$ 后逐项积分。

**（Ⅳ）先求导会大幅化简**。注意
$$(x\arctan x-\frac12\ln(1+x^{2}))'=\arctan x+\frac{x}{1+x^{2}}-\frac{x}{1+x^{2}}=\arctan x ,$$
**两项恰好抵消**，导数就是 $\arctan x$！于是原函数是 $\int_0^x\arctan t dt$，用 $\arctan$ 的展开逐项积分即可。

总结：**遇到对数、反三角函数，先求导往往能化成有理式或二项式**，这是间接展开法的核心。

@解答
（Ⅰ）
$$\frac{1}{x^{2}-3x+2}=\frac{1}{(x-1)(x-2)}=\frac{1}{1-x}-\frac{1}{2-x}=\frac{1}{1-x}-\frac12\cdot\frac{1}{1-\frac x2} ,$$
故
$$f_1(x)=\sum_{n=0}^{\infty}x^{n}-\frac12\sum_{n=0}^{\infty}\frac{x^{n}}{2^{n}}=\sum_{n=0}^{\infty}(1-\frac{1}{2^{n+1}})x^{n},  |x|<1 .$$

（Ⅱ）由 $1-x-2x^{2}=(1-2x)(1+x)$，
$$f_2(x)=\ln(1-2x)+\ln(1+x)=-\sum_{n=1}^{\infty}\frac{(2x)^{n}}{n}+\sum_{n=1}^{\infty}\frac{(-1)^{n-1}x^{n}}{n}=\sum_{n=1}^{\infty}\frac{(-1)^{n-1}-2^{n}}{n}x^{n} .$$
收敛域：$\ln(1-2x)$ 要求 $-\dfrac12\leqslant x<\dfrac12$，$\ln(1+x)$ 要求 $-1<x\leqslant1$，取交集得
$$[-\frac12,\ \frac12) .$$

（Ⅲ）由 $f_3'(x)=\dfrac{1}{\sqrt{1+x^{2}}}=(1+x^{2})^{-\frac12}$ 及二项展开
$$(1+u)^{-\frac12}=\sum_{n=0}^{\infty}\frac{(-1)^{n}(2n)!}{4^{n}(n!)^{2}}u^{n} (|u|<1) ,$$
取 $u=x^{2}$ 并逐项积分（$f_3(0)=0$）：
$$f_3(x)=\sum_{n=0}^{\infty}\frac{(-1)^{n}(2n)!}{4^{n}(n!)^{2}(2n+1)}x^{2n+1},  -1\leqslant x\leqslant1 .$$

（Ⅳ）注意
$$f_4'(x)=\arctan x+\frac{x}{1+x^{2}}-\frac{x}{1+x^{2}}=\arctan x ,$$
且 $f_4(0)=0$，故 $f_4(x)=\displaystyle\int_0^x\arctan t dt$。由 $\arctan t=\sum\limits_{n=0}^{\infty}\dfrac{(-1)^{n}t^{2n+1}}{2n+1}$（$|t|\leqslant1$）逐项积分：
$$f_4(x)=\sum_{n=0}^{\infty}\frac{(-1)^{n}}{(2n+1)(2n+2)}x^{2n+2},  -1\leqslant x\leqslant1 .$$

@考点
四个基本展开式（几何级数、$\ln(1+x)$、$(1+x)^{\alpha}$、$\arctan x$）的逆用；部分分式分解；对数的加法拆分；"先求导、后展开、再积分"的间接展开法；收敛域取交集与端点判别。

易混：（Ⅱ）中两块的收敛域一个是 $[-\frac12,\frac12)$、一个是 $(-1,1]$，**交集的端点要逐个验证**，不能简单取较小的半径了事。

@易错
1. （Ⅰ）部分分式系数算错，或忘记把 $\frac{1}{2-x}$ 提出 $\frac12$。
2. （Ⅱ）收敛域写成 $(-\frac12,\frac12)$（漏掉左端点）。
3. （Ⅲ）二项式系数 $\frac{(-1)^{n}(2n)!}{4^{n}(n!)^{2}}$ 记错。
4. （Ⅳ）没发现两项抵消，硬展开两个函数再相减。

[54]
@题目
微分方程 $(1 + y^2)dx + (2x - 1)y\,dy = 0$ 的通解为 ＿＿＿＿.

@切入点
方程 $(1+y^{2})dx+(2x-1)y dy=0$ 是微分形式写法。先判类型：把含 $x$ 的量与含 $y$ 的量分到两边看看能否**分离变量**：
$$(1+y^{2})dx=-(2x-1)y dy\Longrightarrow \frac{dx}{2x-1}=-\frac{y dy}{1+y^{2}} ,$$
左端只含 $x$、右端只含 $y$，确实可分离——这是最容易处理的一类，不必去判是否恰当方程或用积分因子。

两边积分时注意**两个积分都是对数型**，而且分子恰好是分母导数的常数倍：
$$\int\frac{dx}{2x-1}=\frac12\ln|2x-1|,  \int\frac{y dy}{1+y^{2}}=\frac12\ln(1+y^{2}) .$$
两个 $\frac12$ 相同，可以一起去掉，于是
$$\ln|2x-1|+\ln(1+y^{2})=C'\Longrightarrow (2x-1)(1+y^{2})=C .$$
**把两个对数合并成一个乘积**，答案就是最简洁的隐式形式。

（分离变量时除以了 $2x-1$，应交代 $x=\frac12$ 对应的 $y$ 任意也是解，它已被 $C=0$ 包含。）

@解答
方程可分离变量：
$$(1+y^{2})dx=-(2x-1)y dy\Longrightarrow \frac{dx}{2x-1}=-\frac{y dy}{1+y^{2}} (2x-1\neq0) .$$
两边积分：
$$\frac12\ln|2x-1|=-\frac12\ln(1+y^{2})+C_1 ,$$
即
$$\ln|2x-1|+\ln(1+y^{2})=2C_1 ,$$
合并对数得通解
$$(2x-1)(1+y^{2})=C (C\ \text{为任意常数}) .$$
（$x=\dfrac12$ 对应 $C=0$，已包含在通解中。）

@考点
可分离变量方程的识别与求解；$\int\frac{f'(u)}{f(u)}du=\ln|f(u)|$；把多个对数合并成乘积形式给出隐式通解。

易混：本题也是恰当方程吗？验算 $\frac{\partial(1+y^{2})}{\partial y}=2y$ 而 $\frac{\partial[(2x-1)y]}{\partial x}=2y$，确实恰当，可以用势函数法；但可分离变量更快。

@易错
1. 分离变量时符号弄错（负号在右端）。
2. 两个 $\frac12$ 处理不一致，导致指数不匹配。
3. 不合并对数，答案写成含 $\ln$ 的形式（不算错但不规范）。
4. 忘记讨论 $2x-1=0$。

[55]
@题目
（Ⅰ）设 $A$ 是 $n$ 阶实对称矩阵，且 $A^{2} = A$，$\mathrm{r}(A) = r\ (r < n)$，计算 $|3E - A|$；
（Ⅱ）设 $A$ 是 $n$ 阶矩阵，且 $A^{2} = A$，$\mathrm{r}(A) = r\ (r < n)$，计算 $|3E - A|$.

@切入点
$A^{2}=A$ 是**幂等矩阵**。这类矩阵的特征值只能是 $0$ 或 $1$：设 $A\alpha=\lambda\alpha$（$\alpha\neq0$），则
$$\lambda\alpha=A\alpha=A^{2}\alpha=\lambda^{2}\alpha\Longrightarrow\lambda^{2}=\lambda\Longrightarrow\lambda\in\{0,1\} .$$

要算 $|3E-A|=\prod(3-\lambda_i)$，就必须知道 $0$ 与 $1$ **各出现几次**，这就要用到"可对角化"：

**（Ⅰ）$A$ 实对称**：必可正交对角化，$A\sim\mathrm{diag}(1,\cdots,1,0,\cdots,0)$，其中 $1$ 的个数等于 $\mathrm r(A)=r$。于是
$$|3E-A|=(3-1)^{r}(3-0)^{n-r}=2^{r}3^{ n-r} .$$

**（Ⅱ）$A$ 只是一般方阵**：还能这么算吗？能——因为 $A^{2}=A$ 意味着 $A$ 被多项式 $\lambda^{2}-\lambda=\lambda(\lambda-1)$ 零化，而这个多项式**无重根**，由"最小多项式无重根 $\Leftrightarrow$ 可对角化"知 $A$ 仍可对角化。

也可以用秩来论证（更初等）：由 $A(A-E)=O$ 得 $\mathrm r(A)+\mathrm r(A-E)\leqslant n$；又 $\mathrm r(A)+\mathrm r(A-E)\geqslant\mathrm r(A-(A-E))=\mathrm r(E)=n$。故 $\mathrm r(A-E)=n-r$，即 $\lambda=1$ 的特征子空间维数为 $n-(n-r)=r$，$\lambda=0$ 的维数为 $n-r$，两者之和为 $n$，$A$ 可对角化。结论与（Ⅰ）相同。

**所以两问答案一样**，这正是本题想让人体会的：实对称只是"可对角化"的一个充分条件，而 $A^{2}=A$ 本身就已经保证了可对角化。

@解答
**（Ⅰ）** 设 $A\alpha=\lambda\alpha$（$\alpha\neq0$），则由 $A^{2}=A$ 得 $\lambda^{2}=\lambda$，故 $\lambda=0$ 或 $1$。

$A$ 实对称，必可对角化，$A\sim\Lambda=\mathrm{diag}(\underbrace{1,\cdots,1}_{k},\underbrace{0,\cdots,0}_{n-k})$，而 $\mathrm r(A)=\mathrm r(\Lambda)=k$，故 $k=r$。于是
$$|3E-A|=|3E-\Lambda|=(3-1)^{r}(3-0)^{ n-r}=2^{r}\cdot3^{ n-r} .$$

**（Ⅱ）** 一般方阵情形，特征值仍只能是 $0,1$。由 $A(A-E)=O$ 得
$$\mathrm r(A)+\mathrm r(A-E)\leqslant n ,$$
又
$$\mathrm r(A)+\mathrm r(A-E)\geqslant\mathrm r[A-(A-E)]=\mathrm r(E)=n ,$$
故 $\mathrm r(A-E)=n-r$。于是
$$\dim\{x:Ax=0\}=n-r,  \dim\{x:(A-E)x=0\}=n-(n-r)=r ,$$
两个特征子空间的维数之和为 $n$，故 $A$ 可对角化，且 $1$ 为 $r$ 重、$0$ 为 $n-r$ 重。因此仍有
$$|3E-A|=2^{r}\cdot3^{ n-r} .$$

@考点
幂等矩阵 $A^{2}=A$ 的特征值只能为 $0,1$；实对称矩阵必可对角化；最小多项式无重根 $\Leftrightarrow$ 可对角化；由 $MN=O$ 与秩的次可加性夹出 $\mathrm r(A)+\mathrm r(A-E)=n$；$|kE-A|=\prod(k-\lambda_i)$。

易混：特征值只有 $0,1$ **不足以**算出行列式，还需要知道重数；重数由"可对角化 $+$ 秩"确定。

@易错
1. （Ⅱ）中认为一般矩阵不可对角化，答不出来或答错。
2. 把 $1$ 的重数与 $0$ 的重数弄反。
3. $|3E-A|$ 写成 $3^{n}-|A|$。
4. 忘记 $\mathrm r(A)$ 等于特征值 $1$ 的重数（对可对角化的幂等矩阵成立）。

[56]
@题目
求方程组
$$\begin{cases} 2x_{1} - x_{2} + 4x_{3} - 3x_{4} = -4, \\ x_{1} + x_{3} - x_{4} = -3, \\ 3x_{1} + x_{2} + x_{3} = 1, \\ 7x_{1} + 7x_{3} - 3x_{4} = 3 \end{cases}$$
的通解.

@切入点
四个方程、四个未知数，但方程之间很可能相关（否则解唯一，题目不会问"通解"）。所以标准做法是对**增广矩阵作初等行变换**化成阶梯形，再读出自由变量。

选主元时有个小技巧：**第二个方程 $x_1+x_3-x_4=-3$ 的系数最简单**（$x_1$ 的系数为 $1$），用它当第一主元可以避免分数。

化简后会发现秩为 $3$（四个方程中有一个是其余的组合），自由变量个数 $4-3=1$，故通解形如"一个特解 $+$ 一个基础解向量的倍数"。

具体解出：$x_4=6$ 被唯一确定，$x_1,x_2$ 都用 $x_3$ 表示，取 $x_3$ 为自由变量。写通解时注意把**常数部分与含参数部分分开**：
$$x=(3,-8,0,6)^{\mathrm T}+t(-1,2,1,0)^{\mathrm T} .$$
最后**代回原方程验证**（尤其是没参与消元的第四个方程），是这类题最有效的自检手段。

@解答
用第二个方程作主元消元：由
$$x_1=-3-x_3+x_4 .$$
代入第一个方程：
$$2(-3-x_3+x_4)-x_2+4x_3-3x_4=-4\Longrightarrow -x_2+2x_3-x_4=2\Longrightarrow x_2=2x_3-x_4-2 .$$
代入第三个方程：
$$3(-3-x_3+x_4)+x_2+x_3=1\Longrightarrow x_2=10+2x_3-3x_4 .$$
两式相等：
$$2x_3-x_4-2=10+2x_3-3x_4\Longrightarrow 2x_4=12\Longrightarrow x_4=6 .$$
于是
$$x_2=2x_3-8,  x_1=3-x_3 .$$
代入第四个方程检验：$7(3-x_3)+7x_3-18=3$，恒成立（说明第四个方程是前三个的线性组合）。

取 $x_3=t$ 为自由变量，通解为
$$x=\begin{pmatrix}3-t\\2t-8\\t\\6\end{pmatrix}=\begin{pmatrix}3\\-8\\0\\6\end{pmatrix}+t\begin{pmatrix}-1\\2\\1\\0\end{pmatrix},  t\in\mathbb R .$$

@考点
非齐次线性方程组的消元求解；解的结构（特解 $+$ 导出组通解）；自由变量个数 $=n-\mathrm r$；用未参与消元的方程验证。

易混：通解中的常数向量是**某一个特解**（取 $t=0$ 得到），不唯一；只要与基础解系配套即可。

@易错
1. 消元时算术出错（可用第四个方程自检）。
2. 自由变量选错，导致表达式复杂。
3. 把 $x_4=6$ 也当成自由变量。
4. 通解写成"特解 $\times t$"的形式。

[57]
@题目
设 $f(x,y)$ 有连续偏导数，在 $P(1,-2)$ 处有 $f'_x(1,-2)=1$，$f'_y(1,-2)=-1$，则 $f(x,y)$ 在 $P(1,-2)$ 处增加最快的方向为________.

@切入点
"函数增加最快的方向"有一个一句话的答案：**梯度方向**。理由是方向导数
$$\frac{\partial f}{\partial\mathbf l}=\nabla f\cdot\mathbf l^{0}=|\nabla f|\cos\langle\nabla f,\mathbf l\rangle ,$$
当 $\mathbf l$ 与 $\nabla f$ 同向时 $\cos=1$ 达到最大，最大值就是 $|\nabla f|$。

所以只需把梯度写出来：
$$\nabla f(1,-2)=(f'_x,f'_y)|_{(1,-2)}=(1,-1) .$$

答案可以写成方向向量 $(1,-1)$，更规范的是给出**单位向量**
$$\frac{(1,-1)}{|(1,-1)|}=(\frac{\sqrt2}{2},-\frac{\sqrt2}{2}) ,$$
因为"方向"通常用单位向量表示。顺带一提，此处的最大方向导数（最大增长率）是 $|\nabla f|=\sqrt2$。

@解答
函数在一点沿各方向的方向导数为
$$\frac{\partial f}{\partial\mathbf l}|_{P}=\nabla f(P)\cdot\mathbf l^{0}=|\nabla f(P)|\cos\theta ,$$
其中 $\theta$ 是 $\mathbf l$ 与 $\nabla f(P)$ 的夹角。故当 $\mathbf l$ 与梯度同向时方向导数最大，即**增加最快的方向就是梯度方向**。

由题设
$$\nabla f(1,-2)=(f'_x(1,-2),\ f'_y(1,-2))=(1,-1) ,$$
单位化得增加最快的方向为
$$(\frac{\sqrt2}{2},\ -\frac{\sqrt2}{2}) ,$$
相应的最大方向导数（最大增长率）为 $|\nabla f|=\sqrt2$。

@考点
方向导数与梯度的关系 $\frac{\partial f}{\partial\mathbf l}=\nabla f\cdot\mathbf l^{0}$；梯度方向是函数增长最快的方向，其模是最大增长率；方向向量的单位化。

易混：梯度的**反方向**是下降最快的方向；与梯度垂直的方向上方向导数为零（等值线方向）。

@易错
1. 答成 $(-1,1)$（那是下降最快的方向）。
2. 不单位化（一般允许，但规范写法应单位化）。
3. 把梯度与等值线的方向混淆。
4. 把最大增长率答成 $1$ 或 $2$。

[58]
@题目
设 $D:x^{2}+y^{2}\leqslant 1$，则
$$I=\iint_{D}\Big(\frac{x^{2}}{4}+\frac{y^{2}}{9}\Big)\mathrm{d}x\mathrm{d}y=\underline{\qquad}$$

@切入点
被积函数 $\dfrac{x^{2}}{4}+\dfrac{y^{2}}{9}$ 是两个平方项的线性组合，而区域是**圆盘**（关于 $x,y$ 完全对称）。所以第一动作是利用**轮换对称性**：
$$\iint_Dx^{2}d\sigma=\iint_Dy^{2}d\sigma ,$$
于是两者都等于
$$\frac12\iint_D(x^{2}+y^{2})d\sigma ,$$
而 $x^{2}+y^{2}=r^{2}$ 在极坐标下最容易算：
$$\iint_Dr^{2}\cdot r drd\theta=2\pi\int_0^1r^{3}dr=\frac\pi2 .$$
故 $\iint x^{2}=\iint y^{2}=\dfrac\pi4$。

最后
$$I=\frac14\cdot\frac\pi4+\frac19\cdot\frac\pi4=(\frac14+\frac19)\frac\pi4=\frac{13}{36}\cdot\frac\pi4=\frac{13\pi}{144} .$$

**要点**：不要被 $\frac14,\frac19$ 这两个不同的系数迷惑而去分别硬算——它们只是最后的加权，$\iint x^{2}$ 与 $\iint y^{2}$ 本身是相等的。

@解答
由 $D$ 关于 $x,y$ 的轮换对称性（圆盘），
$$\iint_Dx^{2}d\sigma=\iint_Dy^{2}d\sigma=\frac12\iint_D(x^{2}+y^{2})d\sigma .$$
用极坐标：
$$\iint_D(x^{2}+y^{2})d\sigma=\int_{0}^{2\pi}\int_{0}^{1}r^{2}\cdot r drd\theta=2\pi\cdot\frac14=\frac\pi2 ,$$
故
$$\iint_Dx^{2}d\sigma=\iint_Dy^{2}d\sigma=\frac\pi4 .$$
因此
$$I=\frac14\cdot\frac\pi4+\frac19\cdot\frac\pi4=\frac\pi4(\frac14+\frac19)=\frac\pi4\cdot\frac{13}{36}=\frac{13\pi}{144} .$$

@考点
二重积分的轮换对称性（区域关于 $y=x$ 对称时 $\iint x^{2}=\iint y^{2}$）；极坐标计算 $\iint(x^{2}+y^{2})d\sigma$；积分的线性性。

易混：轮换对称性要求**区域**在交换 $x,y$ 下不变；本题是圆盘，满足。若区域是椭圆盘就不能这样用。

@易错
1. 分别用极坐标硬算 $\iint x^{2}$（要算 $\cos^{2}\theta$ 的积分，慢且易错）。
2. $\iint r^{2}\cdot r dr$ 中漏掉面积元的 $r$。
3. $\frac14+\frac19$ 通分出错。
4. 误以为被积函数的系数不同就不能用对称性。

[59]
@题目
设总体服从 $N(\mu,8)$，$X_1,X_2,\cdots,X_{36}$ 是来自总体 $X$ 的简单随机样本，$\overline{X} = \frac{1}{36}\sum_{i=1}^{36}X_i$，若以 $(\overline{X} - 1,\ \overline{X} + 1)$ 作为 $\mu$ 的置信区间，$\Phi(x)$ 为 $N(0,1)$ 的分布函数，则置信度为 $\underline{\qquad\qquad}$。

@切入点
"以 $(\overline X-1,\overline X+1)$ 作为 $\mu$ 的置信区间，求置信度"就是求
$$P\{\overline X-1<\mu<\overline X+1\}=P\{|\overline X-\mu|<1\} .$$

所以只需知道 $\overline X-\mu$ 的分布。总体 $N(\mu,8)$（**第二个参数是方差**），样本容量 $36$，故
$$\overline X\sim N(\mu,\ \frac{8}{36})=N(\mu,\ \frac29),  \sigma_{\overline X}=\frac{\sqrt2}{3} .$$

标准化：
$$P\{|\overline X-\mu|<1\}=P\{|Z|<\frac{1}{\sqrt2/3}\}=P\{|Z|<\frac{3}{\sqrt2}\}=2\Phi(\frac{3\sqrt2}{2})-1 .$$

$\dfrac{3\sqrt2}{2}=\dfrac{3}{\sqrt2}\approx2.12$，查表 $\Phi(2.12)\approx0.983$，故置信度约 $0.966$。

关键细节：$N(\mu,8)$ 中 $8$ 是**方差**不是标准差；$\sigma_{\overline X}=\frac{\sigma}{\sqrt n}=\frac{2\sqrt2}{6}=\frac{\sqrt2}{3}$。

@解答
总体 $X\sim N(\mu,8)$（方差 $\sigma^{2}=8$），$n=36$，故
$$\overline X\sim N(\mu,\ \frac{\sigma^{2}}{n})=N(\mu,\ \frac{8}{36}),  \sigma_{\overline X}=\sqrt{\frac{8}{36}}=\frac{2\sqrt2}{6}=\frac{\sqrt2}{3} .$$

置信度为
$$P\{\overline X-1<\mu<\overline X+1\}=P\{|\overline X-\mu|<1\}=P\{|Z|<\frac{1}{\frac{\sqrt2}{3}}\}=P\{|Z|<\frac{3\sqrt2}{2}\} ,$$
其中 $Z\sim N(0,1)$。故置信度
$$=2\Phi(\frac{3\sqrt2}{2})-1\approx2\Phi(2.12)-1\approx0.966 .$$

@考点
置信区间与置信度的关系；样本均值的分布 $\overline X\sim N(\mu,\frac{\sigma^{2}}{n})$；标准化与 $P\{|Z|<u\}=2\Phi(u)-1$。

易混：$N(\mu,\sigma^{2})$ 记号中第二个参数是**方差**；本题 $\sigma^{2}=8$、$\sigma=2\sqrt2$，若当成标准差会把 $\sigma_{\overline X}$ 算成 $\frac{8}{6}$。

@易错
1. 把 $8$ 当成标准差。
2. 忘记除以 $\sqrt n$。
3. 用单侧公式 $\Phi(u)$ 而不是双侧的 $2\Phi(u)-1$。
4. $\frac{3}{\sqrt2}$ 有理化出错。

[60]
@题目
计算
$$I=\int_L \frac{x\,dy-y\,dx}{x^2+y^2}$$
其中 $L$ 是从点 $A(1,1)$ 沿直线到点 $B(-1,0)$，再沿曲线 $y=x^2-1$ 到点 $C(1,0)$．

@切入点
被积式 $\dfrac{x dy-y dx}{x^{2}+y^{2}}$ 又是那个"原点为奇点的场"。在不含原点的区域内它与路径无关，绕原点一周则贡献 $2\pi$。

$L$ 不是闭曲线（从 $A(1,1)$ 到 $B(-1,0)$ 再到 $C(1,0)$），所以**补一段把它闭合**。最省事的补法是直线段 $\overline{CA}$：$x\equiv1$，此时 $dx=0$，被积式化成 $\dfrac{dy}{1+y^{2}}$，积分立刻得 $\arctan$ 的值——**补的那段一定要选"好算"的**。

闭合后需要判断两件事：
1. **取向**：$A(1,1)\to B(-1,0)\to C(1,0)\to A$，画出来是逆时针；
2. **原点是否在内部**：闭曲线由线段 $AB$（即 $y=\frac{x+1}{2}$）与抛物线 $y=x^{2}-1$、线段 $CA$ 围成；在 $x=0$ 处上边界 $y=\frac12$、下边界 $y=-1$，故原点在内部。

于是闭曲线积分为 $2\pi$，再减去补段即得。

@解答
补上线段 $\overline{CA}$：从 $C(1,0)$ 到 $A(1,1)$，则 $L+\overline{CA}$ 构成闭曲线 $\Gamma$。

**取向与位置**：$\Gamma$ 依次经过 $(1,1)\to(-1,0)\to(0,-1)\to(1,0)\to(1,1)$，为**逆时针**；在 $x=0$ 处，上边界（线段 $AB$：$y=\frac{x+1}{2}$）取值 $\frac12$，下边界（抛物线）取值 $-1$，故原点在 $\Gamma$ 内部。

由挖洞法（或取小圆计算）知，对包围原点的逆时针闭曲线
$$\oint_{\Gamma}\frac{x dy-y dx}{x^{2}+y^{2}}=2\pi .$$

**补段的积分**：在 $\overline{CA}$ 上 $x=1$，$dx=0$，$y:0\to1$，
$$\int_{\overline{CA}}\frac{x dy-y dx}{x^{2}+y^{2}}=\int_{0}^{1}\frac{dy}{1+y^{2}}=\arctan1=\frac\pi4 .$$

故
$$I=\oint_{\Gamma}-\int_{\overline{CA}}=2\pi-\frac\pi4=\frac{7\pi}{4} .$$

@考点
带奇点的平面曲线积分；补线法把非闭曲线化为闭曲线；绕原点一周的环流为 $2\pi$；选取"易算"的补线。

易混：$\oint\frac{x dy-y dx}{x^{2}+y^{2}}$ 的值只取决于曲线绕原点的圈数与方向：绕一圈逆时针为 $2\pi$，不绕为 $0$。

@易错
1. 忘记判断原点是否在闭曲线内部。
2. 取向判断错，符号写反。
3. 补段选得不好（如选过原点的线段，那样奇点落在路径上）。
4. 最后忘记减去补段的积分（应是"闭曲线积分 $-$ 补段积分"）。

[61]
@题目
设 $X$ 在区间 $[-1,b]$ 上服从均匀分布，由切比雪夫不等式有 $P\{|X-1|<\varepsilon\}\geqslant\dfrac{2}{3}$，则 $b=$ ______，$\varepsilon=$ ______.

@切入点
切比雪夫不等式的标准形是
$$P\{|X-EX|<\varepsilon\}\geqslant1-\frac{DX}{\varepsilon^{2}} .$$
题目给的是 $P\{|X-1|<\varepsilon\}\geqslant\dfrac23$，把两者**对号入座**就能读出两条信息：

1. 绝对值里减去的必须是 $EX$，故 $EX=1$。均匀分布 $U[-1,b]$ 的期望是 $\dfrac{-1+b}{2}$，令其等于 $1$ 得 $b=3$。
2. 右端 $1-\dfrac{DX}{\varepsilon^{2}}=\dfrac23$，即 $\dfrac{DX}{\varepsilon^{2}}=\dfrac13$。

$b=3$ 时区间是 $[-1,3]$，长度 $4$，方差
$$DX=\frac{(3-(-1))^{2}}{12}=\frac{16}{12}=\frac43 .$$
代入得 $\varepsilon^{2}=3DX=4$，即 $\varepsilon=2$。

**先定 $b$ 再定 $\varepsilon$** 的顺序不能颠倒，因为 $DX$ 依赖于 $b$。

@解答
切比雪夫不等式：
$$P\{|X-EX|<\varepsilon\}\geqslant1-\frac{DX}{\varepsilon^{2}} .$$
与题给 $P\{|X-1|<\varepsilon\}\geqslant\dfrac23$ 对照：

**（1）定 $b$**：必须 $EX=1$。$X\sim U[-1,b]$ 的期望为 $\dfrac{-1+b}{2}$，故
$$\frac{b-1}{2}=1\Longrightarrow b=3 .$$

**（2）定 $\varepsilon$**：此时 $X\sim U[-1,3]$，
$$DX=\frac{(3-(-1))^{2}}{12}=\frac{16}{12}=\frac43 .$$
由 $1-\dfrac{DX}{\varepsilon^{2}}=\dfrac23$ 得
$$\frac{DX}{\varepsilon^{2}}=\frac13\Longrightarrow \varepsilon^{2}=3DX=4\Longrightarrow \varepsilon=2 .$$

即 $b=3$，$\varepsilon=2$。

@考点
切比雪夫不等式的标准形式；均匀分布 $U[a,b]$ 的期望 $\frac{a+b}{2}$ 与方差 $\frac{(b-a)^{2}}{12}$；由不等式的形式反读参数。

易混：均匀分布的方差是 $\frac{(b-a)^{2}}{12}$（区间长度的平方除以 $12$），不是 $\frac{b^{2}-a^{2}}{12}$。

@易错
1. 不先定 $b$ 就算 $DX$。
2. 把 $EX$ 写成 $\frac{b+1}{2}$（下限是 $-1$）。
3. 方差公式记错。
4. 解出 $\varepsilon^{2}=4$ 后取 $\varepsilon=-2$。

[62]
@题目
设曲线
$$y = \int_0^{\frac{x}{n}} n\sqrt{\sin t}\,dt$$
（$n$ 为正整数）在 $[0, n\pi]$ 上的全长为 $S_n$.
（Ⅰ）求 $S_n$；
（Ⅱ）求级数 $\sum\limits_{n=1}^{\infty} \dfrac{x^n}{S_n S_{n+1}}$ 的收敛域及和函数.

@切入点
（Ⅰ）弧长公式 $S=\displaystyle\int\sqrt{1+(y')^{2}}dx$。先求导：由变限积分求导（上限是 $\frac xn$，要乘内层导数 $\frac1n$）
$$y'=n\sqrt{\sin\frac xn}\cdot\frac1n=\sqrt{\sin\frac xn} ,$$
**系数 $n$ 恰好被 $\frac1n$ 消掉**，这是题目设计的第一处巧妙。于是
$$1+(y')^{2}=1+\sin\frac xn .$$

接着的关键是**开方**：用半角恒等式
$$1+\sin u=(\sin\frac u2+\cos\frac u2)^{2}\Longrightarrow\sqrt{1+\sin u}=|\sin\frac u2+\cos\frac u2| ,$$
在 $u\in[0,\pi]$ 上两项都非负，可以去绝对值。换元 $u=\frac xn$（$dx=n du$）后积分得 $S_n=4n$——**结果是 $n$ 的一次函数**，非常干净。

（Ⅱ）代入得
$$\sum\frac{x^{n}}{S_nS_{n+1}}=\frac{1}{16}\sum\frac{x^{n}}{n(n+1)} ,$$
系数 $\frac{1}{n(n+1)}$ 可**裂项** $\frac1n-\frac{1}{n+1}$，分别对应 $-\ln(1-x)$ 与它的平移。求和时注意 $\sum\frac{x^{n}}{n+1}$ 要先乘除 $x$ 做下标平移，并**单独补上 $x=0$ 与 $x=1$ 处的值**。

收敛域：$R=1$，且两个端点处系数是 $\frac{1}{n(n+1)}\sim\frac{1}{n^{2}}$，绝对收敛，故收敛域是闭区间 $[-1,1]$。

@解答
（Ⅰ）由变限积分求导，
$$y'=n\sqrt{\sin\frac xn}\cdot\frac1n=\sqrt{\sin\frac xn} ,$$
故
$$S_n=\int_{0}^{n\pi}\sqrt{1+(y')^{2}}dx=\int_{0}^{n\pi}\sqrt{1+\sin\frac xn} dx .$$
令 $u=\dfrac xn$（$dx=n du$，$u:0\to\pi$）：
$$S_n=n\int_{0}^{\pi}\sqrt{1+\sin u} du=n\int_{0}^{\pi}|\sin\frac u2+\cos\frac u2|du=n\int_{0}^{\pi}(\sin\frac u2+\cos\frac u2)du ,$$
（$u\in[0,\pi]$ 时 $\frac u2\in[0,\frac\pi2]$，两项都非负）。于是
$$S_n=n[-2\cos\frac u2+2\sin\frac u2]_{0}^{\pi}=n[(0+2)-(-2+0)]=4n .$$

（Ⅱ）代入得
$$\sum_{n=1}^{\infty}\frac{x^{n}}{S_nS_{n+1}}=\frac{1}{16}\sum_{n=1}^{\infty}\frac{x^{n}}{n(n+1)} .$$
收敛半径 $R=1$；在 $x=\pm1$ 处 $|\frac{1}{n(n+1)}|\sim\frac{1}{n^{2}}$，级数绝对收敛。故**收敛域为 $[-1,1]$**。

由 $\dfrac{1}{n(n+1)}=\dfrac1n-\dfrac{1}{n+1}$ 及
$$\sum_{n=1}^{\infty}\frac{x^{n}}{n}=-\ln(1-x),  \sum_{n=1}^{\infty}\frac{x^{n}}{n+1}=\frac1x\sum_{m=2}^{\infty}\frac{x^{m}}{m}=\frac{-\ln(1-x)-x}{x}\ (x\neq0) ,$$
得当 $x\neq0$ 且 $x\neq1$ 时
$$\sum_{n=1}^{\infty}\frac{x^{n}}{n(n+1)}=-\ln(1-x)+\frac{\ln(1-x)+x}{x}=1+\frac{(1-x)\ln(1-x)}{x} ,$$
故和函数
$$S(x)=\frac{1}{16}[1+\frac{(1-x)\ln(1-x)}{x}] (x\in[-1,1),\ x\neq0) ,$$
且由级数直接计算 $S(0)=0$，$S(1)=\dfrac{1}{16}\displaystyle\sum_{n=1}^{\infty}\frac{1}{n(n+1)}=\frac{1}{16}$（与上式的极限一致）。

@考点
弧长公式；变限积分求导（上限为复合函数）；半角恒等式 $1+\sin u=(\sin\frac u2+\cos\frac u2)^{2}$；裂项与幂级数求和；下标平移；端点处和函数的补充定义。

易混：$\sqrt{(\sin\frac u2+\cos\frac u2)^{2}}=|\sin\frac u2+\cos\frac u2|$，必须先判断符号才能去绝对值；本题在 $[0,\pi]$ 上恰好非负。

@易错
1. $y'$ 忘记乘内层导数 $\frac1n$，多出一个 $n$。
2. 开方时不加绝对值或不说明符号。
3. 求和时 $\sum\frac{x^{n}}{n+1}$ 的下标平移出错（应从 $m=2$ 开始）。
4. 漏掉 $x=0$、$x=1$ 处的单独说明。

[63]
@题目
设 $f(x)$ 是连续函数，且
$$f(x) = \cos x - \int_0^x (x - t) f(t)\,dt,$$
求 $f(x)$.

@切入点
方程里 $f$ 既在等号左边、又出现在积分号里，是**积分方程**。标准办法是**求导把积分号去掉**，化成微分方程。

求导前先把 $(x-t)$ 拆开，让 $x$ 从被积函数里"跑出来"：
$$\int_{0}^{x}(x-t)f(t)dt=x\int_{0}^{x}f(t)dt-\int_{0}^{x}tf(t)dt ,$$
这样两个积分的被积函数都不含 $x$，可以直接用变限积分求导。求导时第一项用乘积法则，会出现 $xf(x)$ 与 $-xf(x)$ **正好抵消**：
$$f'(x)=-\sin x-\int_{0}^{x}f(t)dt-xf(x)+xf(x)=-\sin x-\int_{0}^{x}f(t)dt .$$
再求一次导即得
$$f''(x)+f(x)=-\cos x .$$

初值从**原方程与一阶导数式**中读出：$f(0)=\cos0=1$，$f'(0)=0$。

解方程时注意 $-\cos x$ 与特征根 $\pm\mathrm i$ **共振**，特解要设成 $x(A\cos x+B\sin x)$。

@解答
把被积函数展开：
$$f(x)=\cos x-x\int_{0}^{x}f(t)dt+\int_{0}^{x}tf(t)dt .$$
求导（注意 $xf(x)$ 相消）：
$$f'(x)=-\sin x-\int_{0}^{x}f(t)dt-xf(x)+xf(x)=-\sin x-\int_{0}^{x}f(t)dt .$$
再求导：
$$f''(x)=-\cos x-f(x)\Longrightarrow f''+f=-\cos x .$$
由原式与一阶导数式得初值
$$f(0)=\cos0=1,  f'(0)=0 .$$

解方程：特征方程 $\lambda^{2}+1=0$，$\lambda=\pm\mathrm i$，齐次通解 $C_1\cos x+C_2\sin x$。右端 $-\cos x$ 与特征根共振，设特解 $y^{*}=x(A\cos x+B\sin x)$，代入得
$$y^{*\prime\prime}+y^{*}=-2A\sin x+2B\cos x=-\cos x\Longrightarrow A=0,\ B=-\frac12 ,$$
即 $y^{*}=-\dfrac x2\sin x$。故
$$f(x)=C_1\cos x+C_2\sin x-\frac x2\sin x .$$
由 $f(0)=C_1=1$；又
$$f'(x)=-C_1\sin x+C_2\cos x-\frac12\sin x-\frac x2\cos x ,$$
$f'(0)=C_2=0$。所以
$$f(x)=\cos x-\frac x2\sin x .$$

@考点
积分方程化为微分方程（求导去积分号）；卷积型被积函数 $(x-t)f(t)$ 的处理（先拆开再求导）；二阶常系数非齐次方程的共振特解；由原方程读取初值。

易混：$\int_0^x(x-t)f(t)dt$ 中 $x$ 同时出现在上限与被积函数里，**不能**直接用 $\frac{d}{dx}\int_0^xg(t)dt=g(x)$；必须先把 $x$ 提出积分号。

@易错
1. 不拆开就求导，漏项或多项。
2. 初值 $f'(0)$ 忘记算（只用 $f(0)$ 定不出两个常数）。
3. 特解不乘 $x$（共振）。
4. 特解代入后系数解错符号。

[64]
@题目
设 $\displaystyle\lim_{x\to\infty}\big(\sqrt{ax^{2}-x+3}-2x\big)=b$，其中 $a,b$ 为常数，$a>0$，则曲线 $y=\sqrt{ax^{2}-x+3}$ 在 $(0,+\infty)$ 内的斜渐近线方程为 ______.

@切入点
斜渐近线 $y=kx+b$ 的定义是
$$\lim_{x\to+\infty}[f(x)-kx-b]=0 ,$$
而题目给的条件 $\displaystyle\lim(\sqrt{ax^{2}-x+3}-2x)=b$ **正是这个形式**（$k=2$）。所以答案的形式已经确定为 $y=2x+b$，只需定出 $a$ 和 $b$。

**定 $a$**：$x\to+\infty$ 时 $\sqrt{ax^{2}-x+3}\sim\sqrt a x$，若极限有限，必须
$$\sqrt a x-2x=(\sqrt a-2)x$$
不发散，即 $\sqrt a=2$，$a=4$。

**定 $b$**：$a=4$ 时用**有理化**（这是处理 $\infty-\infty$ 型根式差的标准动作）：
$$\sqrt{4x^{2}-x+3}-2x=\frac{(4x^{2}-x+3)-4x^{2}}{\sqrt{4x^{2}-x+3}+2x}=\frac{-x+3}{\sqrt{4x^{2}-x+3}+2x}\to\frac{-x}{4x}=-\frac14 .$$

故斜渐近线为 $y=2x-\dfrac14$。（题目限定在 $(0,+\infty)$ 内，即 $x\to+\infty$ 的那一支。）

@解答
设 $x\to+\infty$。因 $\sqrt{ax^{2}-x+3}\sim\sqrt a x$，若极限
$$\lim_{x\to+\infty}(\sqrt{ax^{2}-x+3}-2x)=b$$
为有限数，必须 $\sqrt a=2$，即 $a=4$。

此时有理化：
$$\sqrt{4x^{2}-x+3}-2x=\frac{(4x^{2}-x+3)-(2x)^{2}}{\sqrt{4x^{2}-x+3}+2x}=\frac{-x+3}{\sqrt{4x^{2}-x+3}+2x} .$$
分子分母同除 $x$：
$$\to\frac{-1}{\sqrt{4}+2}=-\frac14 ,$$
即 $b=-\dfrac14$。

由斜渐近线的定义 $\lim\limits_{x\to+\infty}[y-(2x+b)]=0$，曲线 $y=\sqrt{4x^{2}-x+3}$ 在 $(0,+\infty)$ 内的斜渐近线为
$$y=2x-\frac14 .$$

@考点
斜渐近线的定义与求法（$k=\lim\frac yx$，$b=\lim(y-kx)$）；$\infty-\infty$ 型根式差的有理化；由极限存在反推参数。

易混：$x\to-\infty$ 时 $\sqrt{4x^{2}-x+3}\sim2|x|=-2x$，与 $2x$ 相减会发散，所以那一支的斜渐近线是 $y=-2x+\frac14$；题目限定 $(0,+\infty)$ 正是为了避开这个讨论。

@易错
1. 由 $\sqrt a=2$ 写成 $a=2$。
2. 不有理化，直接把两项都换成主部，得 $b=0$。
3. 有理化后分子分母同除 $x$ 时符号出错。
4. 忘记斜渐近线要写成 $y=kx+b$ 的完整形式。

[65]
@题目
设随机变量 $X,Y,Z$ 满足 $EX=EY=1$，$EZ=-1$，$DX=DY=DZ=1$，$\rho_{XY}=0$，$\rho_{XZ}=\dfrac{1}{2}$，$\rho_{YZ}=-\dfrac{1}{2}$，求 $E(X+Y-2Z)$，$D(X+Y+Z)$.

@切入点
两个小问分别只用一条公式，关键是不要把它们的适用条件搞混：

**期望是线性的，无条件成立**：
$$E(X+Y-2Z)=EX+EY-2EZ ,$$
不需要独立、不需要不相关。代入 $1,1,-1$ 即得 $1+1+2=4$。

**方差不是线性的**，三个变量之和的方差要展开成
$$D(X+Y+Z)=DX+DY+DZ+2[\mathrm{Cov}(X,Y)+\mathrm{Cov}(X,Z)+\mathrm{Cov}(Y,Z)] ,$$
**三个协方差项一个都不能少**。由于本题 $DX=DY=DZ=1$，标准差都是 $1$，故
$$\mathrm{Cov}=\rho\sqrt{D\cdot D}=\rho ,$$
协方差直接等于相关系数，代入即可。

有趣的是 $\rho_{XZ}=\frac12$ 与 $\rho_{YZ}=-\frac12$ **恰好抵消**，加上 $\rho_{XY}=0$，括号里总和为零，于是方差就等于三个方差之和 $3$——但这是**算出来**的巧合，不能一开始就当成独立。

@解答
**期望**（线性性，无需任何独立性假设）：
$$E(X+Y-2Z)=EX+EY-2EZ=1+1-2\times(-1)=4 .$$

**方差**：因 $DX=DY=DZ=1$，标准差均为 $1$，故
$$\mathrm{Cov}(X,Y)=\rho_{XY}=0,  \mathrm{Cov}(X,Z)=\rho_{XZ}=\frac12,  \mathrm{Cov}(Y,Z)=\rho_{YZ}=-\frac12 .$$
于是
$$D(X+Y+Z)=DX+DY+DZ+2[\mathrm{Cov}(X,Y)+\mathrm{Cov}(X,Z)+\mathrm{Cov}(Y,Z)]$$
$$=1+1+1+2(0+\frac12-\frac12)=3 .$$

@考点
期望的线性性；三个随机变量之和的方差公式（含三个协方差项）；$\mathrm{Cov}(X,Y)=\rho_{XY}\sqrt{DX}\sqrt{DY}$。

易混：$D(X+Y+Z)=DX+DY+DZ$ 只在两两不相关时成立；本题虽然结果相同，但过程必须写出协方差项。

@易错
1. 直接写 $D=3$ 而不展开协方差（过程不完整）。
2. 协方差项只写两个或漏掉系数 $2$。
3. $\mathrm{Cov}=\rho DX DY$（应是标准差之积）。
4. $E(-2Z)$ 算成 $-2$（$EZ=-1$，故为 $+2$）。

[66]
@题目
设
$$A = \begin{bmatrix} 1 & 0 & 0 \\ 0 & -2 & 0 \\ 0 & 0 & 1 \end{bmatrix}$$
且 $A^{*}BA = 2BA - 8E$，求 $B$.

@切入点
方程 $A^{*}BA=2BA-8E$ 中 $B$ 被夹在中间，直接解很别扭。观察到**两端都含 $BA$**，所以把它当成一个整体：
$$A^{*}(BA)-2(BA)=-8E\Longrightarrow (A^{*}-2E)(BA)=-8E .$$
于是
$$BA=-8(A^{*}-2E)^{-1},  B=-8(A^{*}-2E)^{-1}A^{-1} .$$
"**把 $BA$ 看成一个未知矩阵**"是本题的关键一步。

剩下的是计算。$A=\mathrm{diag}(1,-2,1)$ 是对角阵，一切都很轻松：
$$|A|=-2,  A^{-1}=\mathrm{diag}(1,-\tfrac12,1),  A^{*}=|A|A^{-1}=\mathrm{diag}(-2,1,-2) .$$
于是 $A^{*}-2E=\mathrm{diag}(-4,-1,-4)$，其逆为 $\mathrm{diag}(-\frac14,-1,-\frac14)$，
$$BA=-8 \mathrm{diag}(-\tfrac14,-1,-\tfrac14)=\mathrm{diag}(2,8,2) ,$$
最后右乘 $A^{-1}$ 得 $B$。

对角矩阵的逆、伴随都是逐个元素处理，几乎不会出错——**遇到对角阵一定要利用这个便利**。

@解答
把 $BA$ 视为整体：
$$A^{*}(BA)-2(BA)=-8E\Longrightarrow (A^{*}-2E)(BA)=-8E .$$

计算 $A$ 的相关量（$A=\mathrm{diag}(1,-2,1)$）：
$$|A|=1\times(-2)\times1=-2,  A^{-1}=\mathrm{diag}(1,-\frac12,1),$$
$$A^{*}=|A|A^{-1}=-2 \mathrm{diag}(1,-\frac12,1)=\mathrm{diag}(-2,1,-2) .$$
故
$$A^{*}-2E=\mathrm{diag}(-4,-1,-4) ,$$
可逆，且
$$BA=-8(A^{*}-2E)^{-1}=-8 \mathrm{diag}(-\frac14,-1,-\frac14)=\mathrm{diag}(2,8,2) .$$
右乘 $A^{-1}$：
$$B=\mathrm{diag}(2,8,2) \mathrm{diag}(1,-\frac12,1)=\mathrm{diag}(2,-4,2)=\begin{pmatrix}2&0&0\\0&-4&0\\0&0&2\end{pmatrix} .$$

@考点
矩阵方程的整体代换（把 $BA$ 当作未知量）；对角矩阵的行列式、逆与伴随；$A^{*}=|A|A^{-1}$。

易混：矩阵乘法不交换，所以从 $(A^{*}-2E)(BA)=-8E$ 解出 $BA$ 时只能**左乘** $(A^{*}-2E)^{-1}$；再由 $BA$ 求 $B$ 时只能**右乘** $A^{-1}$。左右不能混。

@易错
1. 试图把 $B$ 直接从中间"提"出来。
2. $A^{*}$ 算错（对角阵的伴随不是简单取倒数）。
3. 左乘右乘搞反。
4. $|A|$ 的符号漏掉。

[67]
@题目
设 $\displaystyle\int_{-\infty}^{+\infty}f(x)\,\mathrm{d}x=a$（$a$ 为常数），$f(x)$ 为偶函数，$\displaystyle F(x)=\int_{-\infty}^{x}f(t)\,\mathrm{d}t$，则对任意 $x_{0}\in(-\infty,+\infty)$，$F(-x_{0})=$（　）.
A. $-F(x_{0})$
B. $F(x_{0})$
C. $\dfrac{a}{2}-\displaystyle\int_{0}^{x_{0}}f(x)\,\mathrm{d}x$
D. $a-\displaystyle\int_{0}^{x_{0}}f(x)\,\mathrm{d}x$

@切入点
$F(x)=\displaystyle\int_{-\infty}^{x}f$ 是"从 $-\infty$ 起算"的变限积分，而 $f$ 是偶函数。要把 $F(-x_0)$ 与 $F(x_0)$、$a$、$\int_0^{x_0}f$ 联系起来，用**区间的加减**最清楚。

第一步，用偶性把左半边翻到右半边：
$$F(-x_0)=\int_{-\infty}^{-x_0}f(t)dt\ \overset{t=-s}{=}\ \int_{x_0}^{+\infty}f(s)ds .$$
第二步，用总积分为 $a$：
$$\int_{x_0}^{+\infty}f=a-\int_{-\infty}^{x_0}f=a-F(x_0) .$$
第三步，把 $F(x_0)$ 拆开（再次用偶性：$\int_{-\infty}^{0}f=\frac a2$）：
$$F(x_0)=\int_{-\infty}^{0}f+\int_{0}^{x_0}f=\frac a2+\int_{0}^{x_0}f .$$
代入即得
$$F(-x_0)=a-\frac a2-\int_{0}^{x_0}f=\frac a2-\int_{0}^{x_0}f(x)dx ,$$
正是选项 C。

关键是记住：**偶函数的原函数（从对称中心起算）是奇函数，但这里的起点是 $-\infty$ 而不是 $0$**，所以要用 $\frac a2$ 把两种起点连起来。这正是 A、B 两个选项失效的原因。

@解答
由 $f$ 为偶函数，作代换 $t=-s$：
$$F(-x_0)=\int_{-\infty}^{-x_0}f(t)dt=\int_{+\infty}^{x_0}f(-s)(-ds)=\int_{x_0}^{+\infty}f(s)ds .$$
又 $\displaystyle\int_{-\infty}^{+\infty}f=a$，故
$$F(-x_0)=a-\int_{-\infty}^{x_0}f=a-F(x_0) .$$
再把 $F(x_0)$ 拆开，并用偶性得 $\displaystyle\int_{-\infty}^{0}f=\frac a2$：
$$F(x_0)=\int_{-\infty}^{0}f+\int_{0}^{x_0}f=\frac a2+\int_{0}^{x_0}f(x)dx .$$
故
$$F(-x_0)=a-\frac a2-\int_{0}^{x_0}f(x)dx=\frac a2-\int_{0}^{x_0}f(x)dx .$$
选 **C**。

@考点
偶函数在对称区间上的积分性质；变限积分的区间可加性；反常积分 $\int_{-\infty}^{+\infty}f=a$ 的使用。

易混：$\int_0^xf$（$f$ 偶）是奇函数，但 $F(x)=\int_{-\infty}^xf$ 不是奇函数也不是偶函数——它等于 $\frac a2+\int_0^xf$，是"奇函数 $+$ 常数"。

@易错
1. 直接套"偶函数的原函数是奇函数"选 A。
2. 忘记 $\int_{-\infty}^{0}f=\frac a2$（这一步需要偶性）。
3. 选 D（漏掉了 $\frac a2$ 与 $a$ 的区别）。
4. 换元时上下限不反号。

[68]
@题目
设可微函数 $f(x,y)$ 在点 $P(x,y)$ 处沿 $\boldsymbol{l}_1=(-1,0)$ 与 $\boldsymbol{l}_2=(0,-1)$ 的方向导数分别为 $x^{2}-y$ 与 $1-x$，且 $f(1,1)=-\dfrac{1}{3}$.
（Ⅰ）求 $f(x,y)$；
（Ⅱ）求 $f(x,y)$ 在 $D=\{(x,y)\mid 0\leqslant y\leqslant 7-x,\ 0\leqslant x\leqslant 7\}$ 上的最大值.

@切入点
（Ⅰ）方向导数与偏导数的关系：$\mathbf l_1=(-1,0)$ 与 $\mathbf l_2=(0,-1)$ 都是**单位向量**（负坐标方向），故
$$\frac{\partial f}{\partial\mathbf l_1}=\nabla f\cdot(-1,0)=-f'_x,  \frac{\partial f}{\partial\mathbf l_2}=-f'_y .$$
于是由题设
$$-f'_x=x^{2}-y\Longrightarrow f'_x=y-x^{2},  -f'_y=1-x\Longrightarrow f'_y=x-1 .$$
**负号是本题第一个坑**——方向取的是负坐标方向。

接着由两个偏导数**还原 $f$**：对 $f'_x$ 关于 $x$ 积分得 $f=xy-\frac{x^{3}}{3}+\varphi(y)$，再用 $f'_y=x+\varphi'(y)=x-1$ 定出 $\varphi'=-1$，最后用 $f(1,1)=-\frac13$ 定常数。

（Ⅱ）闭区域求最值仍是"内部驻点 $+$ 三条边界"。三条边界里
- $y=0$ 与 $x=0$ 上 $f\leqslant0$，很快排除；
- 斜边 $x+y=7$ 上代入化成一元三次函数，求导找驻点。

最后比较所有候选值。注意内部驻点 $(1,1)$ 的值 $-\frac13$ 是负的，真正的最大值出现在斜边上。

@解答
（Ⅰ）$\mathbf l_1=(-1,0)$、$\mathbf l_2=(0,-1)$ 都是单位向量，故
$$\frac{\partial f}{\partial\mathbf l_1}=-f'_x=x^{2}-y\Longrightarrow f'_x=y-x^{2} ,$$
$$\frac{\partial f}{\partial\mathbf l_2}=-f'_y=1-x\Longrightarrow f'_y=x-1 .$$
对 $f'_x$ 关于 $x$ 积分：
$$f(x,y)=xy-\frac{x^{3}}{3}+\varphi(y) .$$
由 $f'_y=x+\varphi'(y)=x-1$ 得 $\varphi'(y)=-1$，$\varphi(y)=-y+C$。故
$$f(x,y)=xy-\frac{x^{3}}{3}-y+C .$$
由 $f(1,1)=1-\dfrac13-1+C=-\dfrac13$ 得 $C=0$，即
$$f(x,y)=xy-\frac{x^{3}}{3}-y .$$

（Ⅱ）$D$ 是以 $(0,0),(7,0),(0,7)$ 为顶点的三角形。

**内部驻点**：$f'_x=y-x^{2}=0$，$f'_y=x-1=0$，得 $(1,1)\in D$，$f(1,1)=1-\dfrac13-1=-\dfrac13$。

**边界 $y=0$（$0\leqslant x\leqslant7$）**：$f=-\dfrac{x^{3}}{3}\leqslant0$，最大值 $0$（$x=0$）。

**边界 $x=0$（$0\leqslant y\leqslant7$）**：$f=-y\leqslant0$，最大值 $0$（$y=0$）。

**边界 $x+y=7$（$0\leqslant x\leqslant7$）**：代入 $y=7-x$，
$$f=x(7-x)-\frac{x^{3}}{3}-(7-x)=-\frac{x^{3}}{3}-x^{2}+8x-7 ,$$
$$f'=-x^{2}-2x+8=0\Longrightarrow x^{2}+2x-8=0\Longrightarrow x=2\ (\text{舍去}\ x=-4) ,$$
$$f(2,5)=-\frac83-4+16-7=\frac73 .$$
端点 $x=0$ 处 $f=-7$，$x=7$ 处 $f<0$。

比较各值：$-\dfrac13,\ 0,\ \dfrac73$，最大值为
$$f_{\max}=\frac73 (\text{在点}\ (2,5)\ \text{处取得}) .$$

@考点
方向导数与梯度的关系（方向为负坐标方向时带负号）；由偏导数还原原函数（分步积分 $+$ 待定函数）；闭区域上的最值（内部驻点 $+$ 各段边界）。

易混：$\frac{\partial f}{\partial\mathbf l}=\nabla f\cdot\mathbf l^{0}$ 中 $\mathbf l^{0}$ 是**单位**向量；本题 $(-1,0)$、$(0,-1)$ 已是单位向量，但方向是负的，故与偏导数差一个负号。

@易错
1. 漏掉负号，得到 $f'_x=x^{2}-y$。
2. 还原 $f$ 时把待定函数写成常数。
3. 边界最值只看驻点不看端点。
4. 忘记比较内部驻点与边界上的值。

[69]
@题目
设随机变量 $X$ 与 $Y$ 相互独立，$X$ 服从 $p=0.6$ 的 $0-1$ 分布，$Y$ 的分布函数为
$$F_Y(y)=\begin{cases}1-\mathrm e^{-y},&y\geqslant0,\\0,&y<0,\end{cases}$$
记 $Z=X-Y$. 求：
（Ⅰ）$P\{Z\leqslant-\tfrac{1}{2}\mid X=0\}$；（Ⅱ）$Z$ 的分布函数.

@切入点
$Z=X-Y$ 中 $X$ 是**离散型**（只取 $0,1$）、$Y$ 是**连续型**，这种"离散 $+$ 连续"的组合，标准做法是**按 $X$ 的取值做全概率分解**：
$$F_Z(z)=P\{X-Y\leqslant z\}=P\{X=0\}P\{-Y\leqslant z\}+P\{X=1\}P\{1-Y\leqslant z\} ,$$
（用了独立性把条件概率换成无条件概率）。这样每一块都变成关于 $Y$ 的简单事件。

（Ⅰ）给定 $X=0$ 时 $Z=-Y$，故
$$P\{Z\leqslant-\tfrac12\mid X=0\}=P\{Y\geqslant\tfrac12\}=\mathrm e^{-\frac12} ,$$
用的是指数分布的生存函数 $P\{Y\geqslant u\}=\mathrm e^{-u}$（$u\geqslant0$）。

（Ⅱ）代入得
$$F_Z(z)=0.4 P\{Y\geqslant-z\}+0.6 P\{Y\geqslant1-z\} .$$
注意 $P\{Y\geqslant u\}$ 本身是**分段**的（$u<0$ 时为 $1$，$u\geqslant0$ 时为 $\mathrm e^{-u}$），所以要按 $-z$ 与 $1-z$ 的符号把 $z$ 轴分成三段：$z<0$、$0\leqslant z<1$、$z\geqslant1$。**分段点来自两个指数的"拐点"**，这是本题最需要细心的地方。

@解答
$P\{X=0\}=0.4$，$P\{X=1\}=0.6$；$Y$ 服从参数 $1$ 的指数分布，$P\{Y\geqslant u\}=\mathrm e^{-u}$（$u\geqslant0$），$=1$（$u<0$）。

（Ⅰ）在 $X=0$ 下 $Z=-Y$，由 $X,Y$ 独立，
$$P\{Z\leqslant-\frac12\mid X=0\}=P\{-Y\leqslant-\frac12\}=P\{Y\geqslant\frac12\}=\mathrm e^{-\frac12} .$$

（Ⅱ）由全概率公式与独立性，
$$F_Z(z)=0.4 P\{-Y\leqslant z\}+0.6 P\{1-Y\leqslant z\}=0.4 P\{Y\geqslant-z\}+0.6 P\{Y\geqslant1-z\} .$$

当 $z<0$ 时：$-z>0$，$1-z>0$，
$$F_Z(z)=0.4\mathrm e^{z}+0.6\mathrm e^{z-1}=(0.4+0.6\mathrm e^{-1})\mathrm e^{z} ;$$
当 $0\leqslant z<1$ 时：$-z\leqslant0$，$1-z>0$，
$$F_Z(z)=0.4\times1+0.6\mathrm e^{z-1}=0.4+0.6\mathrm e^{z-1} ;$$
当 $z\geqslant1$ 时：$-z<0$，$1-z\leqslant0$，
$$F_Z(z)=0.4+0.6=1 .$$

即
$$F_Z(z)=\begin{cases}(0.4+0.6\mathrm e^{-1})\mathrm e^{z},&z<0,\\[2pt] 0.4+0.6\mathrm e^{z-1},&0\leqslant z<1,\\[2pt] 1,&z\geqslant1 .\end{cases}$$

@考点
离散型与连续型变量组合的分布（按离散变量取值作全概率分解）；指数分布的生存函数；分布函数的分段计算。

易混：$P\{Y\geqslant u\}$ 只有在 $u\geqslant0$ 时才等于 $\mathrm e^{-u}$；$u<0$ 时它等于 $1$。忘了这一点就会得到大于 $1$ 的"概率"。

@易错
1. 只写一个表达式，不分段。
2. 分段点取成 $z=0$ 一个（还应有 $z=1$）。
3. 把 $P\{1-Y\leqslant z\}$ 写成 $P\{Y\leqslant1-z\}$（不等号方向反了）。
4. 检验 $F_Z$ 的连续性与单调性（可用 $z\to0^{-}$ 与 $z\to0^{+}$ 的值是否相等来自检）。

[70]
@题目
设 $\Sigma$ 为曲面 $z=2-x^2-y^2\ (x\geqslant 0,\ y\geqslant 0)$ 被柱面 $x^2+y^2=1$ 所截出部分的上侧，计算
$$I=\iint_\Sigma yz\,dxdy+zx\,dydz+xy\,dzdx$$

@切入点
$\Sigma$ 是**非闭**曲面（四分之一抛物面），补面用高斯公式会补出好几块，不划算。更直接的做法是**把三个第二类积分统一化成对 $dxdy$ 的积分**，因为 $\Sigma$ 可以整体投影到 $xOy$ 面上。

转化公式（对显式曲面 $z=z(x,y)$ 取**上**侧）：
$$dydz=-z_x dxdy,  dzdx=-z_y dxdy .$$
本题 $z=2-x^{2}-y^{2}$，$z_x=-2x$，$z_y=-2y$，故
$$dydz=2x dxdy,  dzdx=2y dxdy .$$

于是
$$I=\iint_{D}[yz+zx\cdot2x+xy\cdot2y]dxdy=\iint_{D}[yz+2x^{2}z+2xy^{2}]dxdy ,$$
其中 $D$ 是四分之一圆盘 $x^{2}+y^{2}\leqslant1$、$x,y\geqslant0$，$z=2-x^{2}-y^{2}$。

最后用极坐标逐项积分。三项分别涉及 $\int\sin\theta$、$\int\cos^{2}\theta$、$\int\cos\theta\sin^{2}\theta$，都很基本；只有含 $\cos^{2}\theta$ 的那一项会产生 $\pi$。

@解答
$\Sigma:z=2-x^{2}-y^{2}$ 取上侧，投影区域
$$D=\{(x,y):x^{2}+y^{2}\leqslant1,\ x\geqslant0,\ y\geqslant0\} .$$
由 $z_x=-2x$，$z_y=-2y$ 及上侧的转化公式
$$dydz=-z_x dxdy=2x dxdy,  dzdx=-z_y dxdy=2y dxdy ,$$
得
$$I=\iint_{D}[yz+2x^{2}z+2xy^{2}]dxdy,  z=2-x^{2}-y^{2} .$$

用极坐标（$0\leqslant\theta\leqslant\dfrac\pi2$，$0\leqslant r\leqslant1$，$z=2-r^{2}$）逐项计算：
$$\iint_Dyz dxdy=\int_{0}^{\frac\pi2}\sin\theta d\theta\int_{0}^{1}r^{2}(2-r^{2})dr=1\cdot(\frac23-\frac15)=\frac{7}{15} ,$$
$$\iint_D2x^{2}z dxdy=2\int_{0}^{\frac\pi2}\cos^{2}\theta d\theta\int_{0}^{1}r^{3}(2-r^{2})dr=2\cdot\frac\pi4\cdot(\frac12-\frac16)=\frac\pi6 ,$$
$$\iint_D2xy^{2}dxdy=2\int_{0}^{\frac\pi2}\cos\theta\sin^{2}\theta d\theta\int_{0}^{1}r^{4}dr=2\cdot\frac13\cdot\frac15=\frac{2}{15} .$$

故
$$I=\frac{7}{15}+\frac\pi6+\frac{2}{15}=\frac35+\frac\pi6 .$$

@考点
第二类曲面积分的"三合一"转化（对上侧曲面 $dydz=-z_xdxdy$、$dzdx=-z_ydxdy$）；极坐标计算二重积分；$\int_0^{\frac\pi2}\cos^{2}\theta d\theta=\frac\pi4$。

易混：转化公式中的负号来自法向量 $(-z_x,-z_y,1)$；取**下**侧时三个式子都要变号。

@易错
1. 转化公式的负号漏掉或多加。
2. 投影区域取成整个圆盘（题设 $x,y\geqslant0$ 只有四分之一）。
3. 极坐标中漏掉面积元的 $r$。
4. $\int_0^{\frac\pi2}\cos^{2}\theta d\theta$ 算成 $\frac\pi2$。

[71]
@题目
设 3 阶实对称矩阵 $A=(\alpha_1,\alpha_2,\alpha_3)$ 有二重特征值 $1$，且 $\alpha_1+2\alpha_2-\alpha_3=0$，$A^{*}$ 是 $A$ 的伴随矩阵.
（Ⅰ）求正交变换 $X=QY$ 将二次型 $f(x_1,x_2,x_3)=X^{\mathrm T}AX$ 化为标准形；
（Ⅱ）求方程组 $A^{*}X=0$ 的通解.

@切入点
题目没有给出 $A$ 的具体元素，只给了两条结构信息，必须把它们"翻译"成特征值与特征向量：

**信息一**：$\alpha_1+2\alpha_2-\alpha_3=0$。注意 $A=(\alpha_1,\alpha_2,\alpha_3)$，所以这句话就是
$$A\begin{pmatrix}1\\2\\-1\end{pmatrix}=0 ,$$
即 $\xi=(1,2,-1)^{\mathrm T}$ 是 $\lambda=0$ 的特征向量。**把"列的线性关系"读成"矩阵乘向量为零"**，是这一步的关键。

**信息二**：$1$ 是二重特征值。加上 $\lambda=0$，三个特征值恰好是 $1,1,0$（三阶矩阵）。

（Ⅰ）$A$ 实对称，$\lambda=1$ 的特征子空间是 $\xi$ 的**正交补**（二维）。在其中取两个正交向量、连同 $\frac{\xi}{|\xi|}$ 一起单位化，就得到正交矩阵 $Q$；标准形的系数就是特征值。

（Ⅱ）$A^{*}$ 的特征值是"其余特征值之积"：
- 对应 $\xi$（$\lambda=0$）：另外两个是 $1,1$，积为 $1$；
- 对应 $\lambda=1$ 的两个方向：另外两个中含 $0$，积为 $0$。

所以 $A^{*}$ 的特征值是 $1,0,0$，$A^{*}X=0$ 的解空间就是 $\lambda=0$（对 $A^{*}$ 而言）的特征子空间，即 $\xi^{\perp}$。于是通解就是"与 $\xi$ 正交"的全体向量，即方程 $x_1+2x_2-x_3=0$ 的解。

@解答
由 $A=(\alpha_1,\alpha_2,\alpha_3)$ 与 $\alpha_1+2\alpha_2-\alpha_3=0$ 得
$$A\xi=0,  \xi=(1,2,-1)^{\mathrm T}\neq0 ,$$
故 $0$ 是 $A$ 的特征值，$\xi$ 是对应的特征向量。又 $1$ 是二重特征值，故 $A$ 的特征值为 $1,1,0$。

（Ⅰ）$A$ 实对称，$\lambda=1$ 的特征子空间是 $\xi$ 的正交补。在其中取两个正交向量
$$\eta_2=(2,-1,0)^{\mathrm T},  \eta_3=(1,2,5)^{\mathrm T} $$
（验证 $\eta_2\cdot\xi=\eta_3\cdot\xi=\eta_2\cdot\eta_3=0$）。单位化后取
$$Q=(\frac{\xi}{\sqrt6},\ \frac{\eta_2}{\sqrt5},\ \frac{\eta_3}{\sqrt{30}})=\begin{pmatrix}\frac{1}{\sqrt6}&\frac{2}{\sqrt5}&\frac{1}{\sqrt{30}}\\ \frac{2}{\sqrt6}&-\frac{1}{\sqrt5}&\frac{2}{\sqrt{30}}\\ -\frac{1}{\sqrt6}&0&\frac{5}{\sqrt{30}}\end{pmatrix} ,$$
则 $Q$ 正交，且正交变换 $X=QY$ 将 $f$ 化为标准形
$$f=0\cdot y_1^{2}+1\cdot y_2^{2}+1\cdot y_3^{2}=y_2^{2}+y_3^{2} .$$

（Ⅱ）$A$ 的特征值为 $1,1,0$，故 $A^{*}$ 的特征值为各自"其余特征值之积"：
$$1\cdot1=1\ (\text{对应}\ \xi),  1\cdot0=0,  1\cdot0=0\ (\text{对应}\ \xi^{\perp}) .$$
于是 $A^{*}X=0$ 的解空间为 $\lambda=0$ 的特征子空间，即 $\xi^{\perp}$：
$$x_1+2x_2-x_3=0 .$$
取 $x_2,x_3$ 为自由变量，得基础解系 $(-2,1,0)^{\mathrm T}$、$(1,0,1)^{\mathrm T}$，通解为
$$X=k_1(-2,1,0)^{\mathrm T}+k_2(1,0,1)^{\mathrm T} (k_1,k_2\ \text{为任意常数}) .$$

@考点
把列向量的线性关系读成 $A\xi=0$；实对称矩阵的特征子空间正交；正交变换化二次型为标准形（系数即特征值）；伴随矩阵的特征值 $=$ 其余特征值之积。

易混：$A^{*}$ 的特征值公式 $\frac{|A|}{\lambda}$ 只在 $|A|\neq0$ 时可用；本题 $|A|=0$，必须用"其余特征值之积"这个更一般的说法。

@易错
1. 没看出 $\alpha_1+2\alpha_2-\alpha_3=0$ 等价于 $A\xi=0$。
2. 正交化时取的两个向量没有互相正交。
3. （Ⅱ）中直接用 $A^{*}=|A|A^{-1}$（$|A|=0$，$A^{-1}$ 不存在）。
4. 把 $A^{*}X=0$ 的解空间当成 $\xi$ 张成的一维空间。

[72]
@题目
将 $f(x) = xe^x$ 在 $x = 2$ 处展开为幂级数，并求 $f^{(n)}(2)$.

@切入点
题目要的是"在 $x=2$ 处展开"，不是在 $x=0$ 处。凡是"在 $x=a$ 处展开"，第一步永远是**把自变量换成 $t=x-a$**，让问题退回到 $t=0$ 处的标准展开。

换元后 $f=(t+2)\mathrm e^{t+2}$，指数上的 $t+2$ 要拆成 $\mathrm e^{2}\cdot\mathrm e^{t}$，把常数 $\mathrm e^{2}$ 提到级数外面；剩下 $\mathrm e^{t}$ 直接套已知展开式 $\sum t^{n}/n!$。前面乘的 $(t+2)$ 是一次多项式，逐项乘进去再合并同次幂即可——这是"多项式 $\times$ 已知级数"的标准套路，不需要求导算系数。

另一条路是直接算 $f^{(n)}(2)$：用莱布尼茨公式对 $x\mathrm e^{x}$ 求 $n$ 阶导，得 $f^{(n)}(x)=(x+n)\mathrm e^{x}$，代 $x=2$ 即得。这条路更快，但题目明确要求先写出幂级数，所以主线走展开、再用 $a_n=f^{(n)}(2)/n!$ 反读导数值——这正是本题的设计意图：**用级数系数去求高阶导数**。

@解答
令 $t=x-2$，则 $x=t+2$，
$$f(x)=x\mathrm e^{x}=(t+2)\mathrm e^{t+2}=\mathrm e^{2}(t+2)\mathrm e^{t} .$$
由 $\mathrm e^{t}=\sum_{n=0}^{\infty}\frac{t^{n}}{n!} (-\infty<t<+\infty)$ 得
$$f(x)=\mathrm e^{2}(t+2)\sum_{n=0}^{\infty}\frac{t^{n}}{n!}=\mathrm e^{2}(\sum_{n=0}^{\infty}\frac{t^{n+1}}{n!}+\sum_{n=0}^{\infty}\frac{2t^{n}}{n!}) .$$
第一个和式中令 $n+1\to n$：
$$\sum_{n=0}^{\infty}\frac{t^{n+1}}{n!}=\sum_{n=1}^{\infty}\frac{t^{n}}{(n-1)!} .$$
合并同次幂（$n\geq1$ 时两式都有，$n=0$ 只有后一式贡献 $2$）：
$$\frac{1}{(n-1)!}+\frac{2}{n!}=\frac{n+2}{n!} ,$$
而 $n=0$ 时 $\frac{0+2}{0!}=2$ 恰好吻合，故统一写成
$$f(x)=\mathrm e^{2}\sum_{n=0}^{\infty}\frac{n+2}{n!}(x-2)^{n} , x\in(-\infty,+\infty) .$$
由幂级数系数与导数的关系 $a_{n}=\frac{f^{(n)}(2)}{n!}$，而 $a_{n}=\frac{(n+2)\mathrm e^{2}}{n!}$，所以
$$f^{(n)}(2)=n! a_{n}=(n+2)\mathrm e^{2} .$$

@考点
在 $x=a$ 处的泰勒展开（换元 $t=x-a$ 化归到 $\mathrm e^{t}$ 的标准展开），以及泰勒系数与高阶导数的互推公式 $f^{(n)}(a)=n!a_{n}$。

易混：$\sum\frac{t^{n}}{n!}$ 的收敛域是全体实数，所以本题展开式对一切 $x$ 成立，不要习惯性地写 $|x-2|<1$。

@易错
1. 忘记换元，直接在 $x=0$ 处展开 $x\mathrm e^{x}$ 后硬凑，得不到 $(x-2)^{n}$ 的形式。
2. $\mathrm e^{t+2}$ 不拆成 $\mathrm e^{2}\mathrm e^{t}$，或把 $\mathrm e^{2}$ 漏掉。
3. 移项换指标时边界没对齐：$\sum_{n=0}^{\infty}\frac{t^{n+1}}{n!}$ 改写后应从 $n=1$ 起，写成从 $n=0$ 起就多了一项。
4. 求 $f^{(n)}(2)$ 时忘记乘 $n!$，直接把系数当成导数值。

[73]
@题目
微分方程
$$\frac{dy}{dx} = \frac{y - x}{y + x}$$
满足 $y(1) = 0$ 的特解为 ＿＿＿＿.

@切入点
方程右端 $\frac{y-x}{y+x}$ 分子分母都是关于 $x,y$ 的一次齐次式，把分子分母同除以 $x$ 就变成 $\frac{y/x-1}{y/x+1}$，只含 $y/x$——这就是**齐次微分方程**的判据。看到它就令 $u=y/x$。

不要先去试"一阶线性"：把方程写成 $\frac{dy}{dx}$ 的形式后，$y$ 在分母里出现，不是线性的；反过来看 $\frac{dx}{dy}$ 也不是线性的。所以齐次代换是唯一顺路的做法。

代换后变量分离，左边出现 $\frac{u+1}{1+u^{2}}du$，要拆成 $\frac{u}{1+u^{2}}du+\frac{1}{1+u^{2}}du$ 两块分别积——一块给对数、一块给反正切，这是本题的固定动作。最后回代时 $\frac12\ln(1+u^{2})+\ln|x|$ 会合并成 $\frac12\ln(x^{2}+y^{2})$，形式变得很干净，这也说明代换方向选对了。

@解答
方程右端只含 $\frac{y}{x}$，为齐次方程。令 $u=\frac{y}{x}$，即 $y=ux$，$\frac{dy}{dx}=u+x\frac{du}{dx}$，代入得
$$u+x\frac{du}{dx}=\frac{u-1}{u+1} ,$$
$$x\frac{du}{dx}=\frac{u-1}{u+1}-u=\frac{u-1-u^{2}-u}{u+1}=-\frac{1+u^{2}}{u+1} .$$
分离变量：
$$\frac{u+1}{1+u^{2}}du=-\frac{dx}{x} .$$
两端积分，左端拆项：
$$\int\frac{u}{1+u^{2}}du+\int\frac{1}{1+u^{2}}du=\frac12\ln(1+u^{2})+\arctan u ,$$
故
$$\frac12\ln(1+u^{2})+\arctan u=-\ln|x|+C .$$
回代 $u=\frac{y}{x}$，注意
$$\frac12\ln(1+\frac{y^{2}}{x^{2}})+\ln|x|=\frac12(\ln(x^{2}+y^{2})-\ln x^{2})+\ln|x|=\frac12\ln(x^{2}+y^{2}) ,$$
于是通解为
$$\frac12\ln(x^{2}+y^{2})+\arctan\frac{y}{x}=C .$$
代入 $y(1)=0$：$\frac12\ln 1+\arctan 0=0$，得 $C=0$。所求特解为
$$\ln(x^{2}+y^{2})+2\arctan\frac{y}{x}=0 .$$

@考点
齐次微分方程 $\frac{dy}{dx}=\varphi(\frac yx)$ 的标准代换 $u=y/x$ 与变量分离；积分 $\int\frac{u+1}{1+u^{2}}du$ 的拆项。

易混：这里的"齐次"指右端是零次齐次函数，与一阶线性方程中"齐次 $=$ 右端为零"是两个完全不同的概念。

@易错
1. 只写 $x\frac{du}{dx}=\frac{u-1}{u+1}$，忘了左边的 $u$ 要移过去（即漏掉 $u+x u'$ 中的 $u$）。
2. $\int\frac{u+1}{1+u^{2}}du$ 不拆项，硬凑成 $\ln(1+u^{2})$ 之类。
3. 回代后不化简，把答案停在含 $\ln|x|$ 的形式上，定常数时容易出错。
4. 忘记用初值定 $C$，只给通解。

[74]
@题目
设事件 $A,B$ 相互独立，$A,C$ 互不相容，且 $P(A)=0.4$，$P(B)=0.3$，$P(C)=0.4$，$P(B\mid C)=0.2$，求下列概率：
（Ⅰ）$P(A\cup B)$；（Ⅱ）$P(C\mid A\cup B)$；（Ⅲ）$P(AB\mid\overline C)$.

@切入点
三个小问都不是"套公式"，而是先把两条结构性条件翻译成集合关系：

- $A,B$ 相互独立 $\Rightarrow P(AB)=P(A)P(B)=0.12$。独立是关于**概率乘积**的条件。
- $A,C$ 互不相容 $\Rightarrow AC=\varnothing$。互不相容是关于**集合本身**的条件，它比独立强得多，可以直接用来删项。

有了 $AC=\varnothing$：
（Ⅱ）中 $C(A\cup B)=CA\cup CB=\varnothing\cup BC=BC$，一整块直接消失；而 $P(BC)$ 不能用独立算（$B,C$ 没说独立），要用给出的 $P(B\mid C)$ 走乘法公式 $P(BC)=P(C)P(B\mid C)$。给 $P(B\mid C)$ 这个条件，就是提示这里必须走乘法公式。
（Ⅲ）中 $AC=\varnothing$ 还意味着 $A\subset\overline C$，于是 $AB\overline C=AB$，条件概率的分子直接退化成 $P(AB)$。

抓住"互不相容 $\Rightarrow$ 交集为空 $\Rightarrow$ 包含于补集"这条链，三问都变成两步算术。

@解答
由 $A,B$ 独立得
$$P(AB)=P(A)P(B)=0.4\times0.3=0.12 .$$
由 $A,C$ 互不相容得 $AC=\varnothing$，从而 $A\subset\overline C$。

（Ⅰ）
$$P(A\cup B)=P(A)+P(B)-P(AB)=0.4+0.3-0.12=0.58 .$$

（Ⅱ）先算分子。由 $AC=\varnothing$，
$$C(A\cup B)=CA\cup CB=\varnothing\cup BC=BC ,$$
而由乘法公式
$$P(BC)=P(C)P(B\mid C)=0.4\times0.2=0.08 ,$$
故
$$P(C\mid A\cup B)=\frac{P(C(A\cup B))}{P(A\cup B)}=\frac{0.08}{0.58}=\frac{4}{29} .$$

（Ⅲ）由 $A\subset\overline C$ 得 $AB\overline C=AB$，又 $P(\overline C)=1-0.4=0.6$，故
$$P(AB\mid\overline C)=\frac{P(AB\overline C)}{P(\overline C)}=\frac{P(AB)}{P(\overline C)}=\frac{0.12}{0.6}=0.2 .$$

@考点
独立性与互不相容的区别与各自的用法；加法公式、乘法公式、条件概率定义；由 $AC=\varnothing$ 推出 $A\subset\overline C$ 这一常用等价说法。

易混：独立与互不相容是两回事。两个概率非零的事件若互不相容则一定不独立（$P(AB)=0\neq P(A)P(B)$）；本题中 $A$ 与 $B$ 独立、$A$ 与 $C$ 互不相容，正是要考这个对比。

@易错
1. 把 $A,C$ 互不相容误用成"独立"，写出 $P(AC)=P(A)P(C)=0.16$。
2. （Ⅱ）中把 $P(BC)$ 当作 $P(B)P(C)$ 计算——题目从未说 $B,C$ 独立，只能用 $P(B\mid C)$。
3. （Ⅱ）中漏掉 $CA=\varnothing$，把分子写成 $P(CA)+P(CB)-P(ABC)$ 一通乱算。
4. （Ⅲ）中把 $P(AB\overline C)$ 拆成 $P(AB)P(\overline C)$，或者没看出 $A\subset\overline C$。

[75]
@题目
设 $\{x_{n}\}$ 为数列，则下列结论中正确的是（　）.
① 若 $\{\arctan x_{n}\}$ 收敛，则 $\{x_{n}\}$ 收敛；
② 若 $\{\arctan x_{n}\}$ 单调，则 $\{x_{n}\}$ 收敛；
③ 若 $x_{n}\in[-1,1]$，且 $\{x_{n}\}$ 收敛，则 $\{\arcsin x_{n}\}$ 收敛；
④ 若 $x_{n}\in[-1,1]$，且 $\{x_{n}\}$ 单调，则 $\{\arcsin x_{n}\}$ 收敛.
A. ①②　　B. ③④　　C. ①③　　D. ②④

@切入点
四个命题分成两组，分界线是 $\arctan$ 与 $\arcsin$ 的**值域是否把无穷"压扁"**：

- $\arctan$ 的定义域是全体实数，值域 $(-\frac\pi2,\frac\pi2)$ 有界。这意味着 $x_n\to+\infty$ 这种发散情形会被压成 $\arctan x_n\to\frac\pi2$ 这种收敛情形——信息丢失了。所以"由 $\arctan x_n$ 的好性质反推 $x_n$ 的好性质"必然不成立，①②直接找 $x_n=n$ 这个反例即可。
- $\arcsin$ 的定义域只有 $[-1,1]$，而题目在③④中恰好补了 $x_n\in[-1,1]$。此时是"由 $x_n$ 的好性质正推 $\arcsin x_n$"，方向反过来了，而且 $\arcsin$ 在 $[-1,1]$ 上连续，连续函数把收敛列映成收敛列，所以③成立；④中单调有界必收敛，先得到 $x_n$ 收敛，再归结为③。

所以判断的钥匙不是"会不会算"，而是先看清每个命题的**推理方向**：①②是反推（用有界函数去恢复原数列，做不到），③④是正推（用连续函数去传递收敛，做得到）。

@解答
① 错。取 $x_{n}=n$，则 $\arctan x_{n}\to\frac{\pi}{2}$ 收敛，但 $\{x_{n}\}$ 发散。

② 错。仍取 $x_{n}=n$，$\arctan x_{n}$ 单调增加，但 $\{x_{n}\}$ 发散。

③ 对。设 $x_{n}\to a$。因 $x_{n}\in[-1,1]$，由极限的保号性（保不等式性）知 $a\in[-1,1]$。$\arcsin x$ 在 $[-1,1]$ 上连续，由复合函数（数列）的连续性
$$\lim_{n\to\infty}\arcsin x_{n}=\arcsin a ,$$
即 $\{\arcsin x_{n}\}$ 收敛。

④ 对。$\{x_{n}\}$ 单调且 $x_{n}\in[-1,1]$ 有界，由单调有界准则知 $\{x_{n}\}$ 收敛，再由③知 $\{\arcsin x_{n}\}$ 收敛。

故正确的是③④，选 B。

@考点
单调有界准则；连续函数保持数列极限（$x_n\to a$、$f$ 在 $a$ 连续 $\Rightarrow f(x_n)\to f(a)$）；有界函数不能反推自变量数列收敛。

易混：单调 $\neq$ 收敛，必须加"有界"；③④中的有界性是由条件 $x_{n}\in[-1,1]$ 白送的，而①②里 $x_n$ 没有任何有界假设，这正是四个命题真假不同的根源。

@易错
1. 认为"$\arctan$ 严格单调，所以有反函数 $\tan$，两边取 $\tan$ 即得 $x_n$ 收敛"——反函数 $\tan$ 在 $\pm\frac\pi2$ 处不连续，极限值落在端点时这一步不成立。
2. 把②当成对的：误以为"单调"就等于"收敛"。
3. ③中不验证极限 $a\in[-1,1]$ 就用连续性（虽然结论对，但推理缺一环）。
4. 只检验①②就选 A，没逐条看完四个命题。

[76]
@题目
设矩阵
$$A = \begin{bmatrix} a & 1 & 1 \\ 0 & a-1 & 0 \\ 1 & 1 & a \end{bmatrix} \text{ 不可逆}, \qquad \beta = \begin{bmatrix} b \\ 1 \\ 1 \end{bmatrix}$$
已知方程组 $A^{\mathrm{T}}X = 0$ 的解均是 $\beta^{\mathrm{T}}X = 0$ 的解.
（Ⅰ）求 $a,b$ 的值；（Ⅱ）求可逆矩阵 $P$，使得 $P^{-1}AP = \Lambda$.

@切入点
题目给了两个条件，要分别翻译：

第一个"$A$ 不可逆"即 $|A|=0$。这个行列式沿第二行展开只有一项，一眼能算出 $|A|=(a-1)^{2}(a+1)$，于是 $a=1$ 或 $a=-1$——得到两个候选，必须用第二个条件筛。

第二个条件"$A^{\mathrm T}X=0$ 的解均是 $\beta^{\mathrm T}X=0$ 的解"是典型的**同解／解集包含**语言，标准翻译是：$\beta^{\mathrm T}$ 可由 $A^{\mathrm T}$ 的行向量线性表示，等价地 $\beta$ 可由 $A$ 的列向量线性表示，也就是非齐次方程组 $Ax=\beta$ 有解，即
$$r(A)=r(A\mid\beta) .$$
这一步是本题的真正关卡：把"解的包含关系"转成"秩相等"，就只剩对两个 $a$ 值各做一次初等行变换的体力活。

（Ⅱ）求 $P$ 是常规题，但要留心 $A$ 不对称，能否对角化不是自动的——必须验证二重特征值 $\lambda=-2$ 的特征子空间确实是二维，即 $r(A+2E)=1$。

@解答
（Ⅰ）$A$ 不可逆，故
$$|A|=\begin{vmatrix}a&1&1\\0&a-1&0\\1&1&a\end{vmatrix}=(a-1)\begin{vmatrix}a&1\\1&a\end{vmatrix}=(a-1)(a^{2}-1)=(a-1)^{2}(a+1)=0 ,$$
得 $a=1$ 或 $a=-1$。

"$A^{\mathrm T}X=0$ 的解都是 $\beta^{\mathrm T}X=0$ 的解"等价于 $\beta^{\mathrm T}$ 可由 $A^{\mathrm T}$ 的行向量线性表示，即 $\beta$ 可由 $A$ 的列向量线性表示，即 $Ax=\beta$ 有解，亦即 $r(A)=r(A\mid\beta)$。

当 $a=1$ 时
$$(A\mid\beta)=\begin{pmatrix}1&1&1&b\\0&0&0&1\\1&1&1&1\end{pmatrix} ,$$
第二行为 $(0,0,0\mid1)$，故 $r(A)=1<r(A\mid\beta)$，无解，舍去。

当 $a=-1$ 时
$$(A\mid\beta)=\begin{pmatrix}-1&1&1&b\\0&-2&0&1\\1&1&-1&1\end{pmatrix}\xrightarrow{r_3+r_1}\begin{pmatrix}-1&1&1&b\\0&-2&0&1\\0&2&0&b+1\end{pmatrix}\xrightarrow{r_3+r_2}\begin{pmatrix}-1&1&1&b\\0&-2&0&1\\0&0&0&b+2\end{pmatrix} ,$$
要 $r(A)=r(A\mid\beta)=2$，必须 $b+2=0$。故
$$a=-1 , b=-2 .$$

（Ⅱ）此时
$$A=\begin{pmatrix}-1&1&1\\0&-2&0\\1&1&-1\end{pmatrix} .$$
沿第二行展开求特征多项式：
$$|A-\lambda E|=(-2-\lambda)\begin{vmatrix}-1-\lambda&1\\1&-1-\lambda\end{vmatrix}=(-2-\lambda)[(1+\lambda)^{2}-1]=(-2-\lambda)\lambda(\lambda+2)=-\lambda(\lambda+2)^{2} ,$$
故特征值为 $\lambda_{1}=0$，$\lambda_{2}=\lambda_{3}=-2$。

$\lambda_{1}=0$：解 $Ax=0$。由 $-2x_{2}=0$ 得 $x_{2}=0$，再由 $-x_{1}+x_{3}=0$ 得 $x_{1}=x_{3}$，取
$$\xi_{1}=(1,0,1)^{\mathrm T} .$$

$\lambda_{2}=\lambda_{3}=-2$：
$$A+2E=\begin{pmatrix}1&1&1\\0&0&0\\1&1&1\end{pmatrix} ,$$
$r(A+2E)=1$，特征子空间维数 $3-1=2$，与重数相等，故 $A$ 可对角化。由 $x_{1}+x_{2}+x_{3}=0$ 得基础解系
$$\xi_{2}=(1,-1,0)^{\mathrm T} , \xi_{3}=(1,0,-1)^{\mathrm T} .$$

取
$$P=(\xi_{1},\xi_{2},\xi_{3})=\begin{pmatrix}1&1&1\\0&-1&0\\1&0&-1\end{pmatrix} ,$$
则 $P$ 可逆，且
$$P^{-1}AP=\Lambda=\begin{pmatrix}0&&\\&-2&\\&&-2\end{pmatrix} .$$

@考点
"$Ax=0$ 的解都是 $Bx=0$ 的解"$\iff$ $B$ 的行向量可由 $A$ 的行向量线性表示 $\iff$ $r(A)=r\binom{A}{B}$；非齐次方程组有解的秩判据；矩阵可对角化的充要条件（每个特征值的几何重数 $=$ 代数重数）。

易混：解集包含关系翻译过来是"行向量的线性表示"。本题的方程组是 $A^{\mathrm T}X=0$，所以要表示的是 $A^{\mathrm T}$ 的行，也就是 $A$ 的列，最终才化成 $Ax=\beta$ 有解；若粗心按 $A$ 的行去做，会得到错误的 $a,b$。

@易错
1. 只用 $|A|=0$ 求出 $a=1,-1$ 就同时保留，没有用第二个条件筛掉 $a=1$。
2. 把"解集包含"直接写成"同解"，多加了反向包含的条件。
3. 转置方向搞反：对 $A^{\mathrm T}X=0$ 却去讨论 $A^{\mathrm T}x=\beta$ 是否有解。
4. （Ⅱ）中不验证 $r(A+2E)=1$ 就断言可对角化；$A$ 并非对称矩阵，这一步不能省。
5. $P$ 的列顺序与 $\Lambda$ 的对角元顺序不对应。

[77]
@题目
设 $f(x)$ 在 $[0,1]$ 上连续，且 $\displaystyle\int_{0}^{1}f(x)\mathrm{d}x=A$，则
$$I=\int_{0}^{1}\mathrm{d}x\int_{x}^{1}f(x)f(y)\mathrm{d}y=\underline{\qquad}$$

@切入点
被积函数是 $f(x)f(y)$，两个变量分开，但积分区域是三角形 $D_{1}:0\leq x\leq1,\ x\leq y\leq1$（即 $y\geq x$ 的那一半），不是矩形，所以不能直接拆成两个一元积分的乘积。

这里的关键特征是：被积函数关于 $x,y$ **对称**（交换 $x,y$ 不变），而正方形 $[0,1]^{2}$ 被对角线 $y=x$ 分成的两块关于这条对角线也对称。于是用"轮换对称"的思路：记另一半上的积分为 $J$，把 $J$ 中的字母 $x,y$ 互换名字，$J$ 就变回 $I$，故 $I=J$；而
$$I+J=\iint_{[0,1]^{2}}f(x)f(y)dxdy=(\int_{0}^{1}f(x)dx)(\int_{0}^{1}f(y)dy)=A^{2} ,$$
正方形上才能拆成乘积。于是 $I=A^{2}/2$。

如果不走对称，硬去交换积分次序，会得到 $I=\int_{0}^{1}f(y)(\int_{0}^{y}f(x)dx)dy$，令 $F(y)=\int_{0}^{y}f(x)dx$，则被积函数是 $F'(y)F(y)$，凑微分得 $\frac12F^{2}(y)|_{0}^{1}=\frac{A^{2}}{2}$——这条路同样干净，代价是要想到引入变限积分 $F$。两条路都可以，对称法更省笔。

@解答
解法一（对称性）。记
$$I=\iint_{D_{1}}f(x)f(y)dxdy , D_{1}: 0\leq x\leq1, x\leq y\leq1 ,$$
$$J=\iint_{D_{2}}f(x)f(y)dxdy , D_{2}: 0\leq x\leq1, 0\leq y\leq x .$$
在 $J$ 中把积分变量 $x$ 与 $y$ 互换名称，$D_{2}$ 变为 $D_{1}$，被积函数 $f(x)f(y)$ 不变，故 $J=I$。

又 $D_{1}\cup D_{2}=[0,1]\times[0,1]$，公共边界 $y=x$ 面积为零，且在正方形上变量可分离：
$$I+J=\int_{0}^{1}  \int_{0}^{1}f(x)f(y)dxdy=(\int_{0}^{1}f(x)dx)(\int_{0}^{1}f(y)dy)=A^{2} .$$
于是 $2I=A^{2}$，
$$I=\frac{A^{2}}{2} .$$

解法二（换序 $+$ 变限积分）。交换积分次序：
$$I=\int_{0}^{1}dy\int_{0}^{y}f(x)f(y)dx=\int_{0}^{1}f(y)(\int_{0}^{y}f(x)dx)dy .$$
令 $F(y)=\int_{0}^{y}f(x)dx$，则 $F'(y)=f(y)$，$F(0)=0$，$F(1)=A$，
$$I=\int_{0}^{1}F(y)F'(y)dy=\frac12F^{2}(y)|_{0}^{1}=\frac{A^{2}}{2} .$$

@考点
二重积分中被积函数关于 $x,y$ 对称时的"补成整块再对半分"技巧；累次积分交换次序；变限积分与凑微分 $FF'=(\frac12F^{2})'$。

易混：只有在**矩形（且边平行于坐标轴）**区域上、被积函数可分离时，二重积分才等于两个一元积分之积；三角形区域上不行，这正是本题必须先补全再对半的原因。

@易错
1. 直接写 $I=(\int_{0}^{1}f(x)dx)(\int_{x}^{1}f(y)dy)$——内层上下限还含 $x$，根本不能提出来。
2. 交换次序时限写错：$0\leq x\leq1,\ x\leq y\leq1$ 换序应为 $0\leq y\leq1,\ 0\leq x\leq y$。
3. 认为 $I=J$ 需要 $f$ 本身有某种对称性；其实只需被积函数关于 $x,y$ 对称，与 $f$ 无关。
4. 漏掉最后的 $\frac12$。

[78]
@题目
设曲面 $S:(x-y)^{2}-z^{2}=1$，求坐标原点到 $S$ 的最短距离.

@切入点
求"原点到曲面的最短距离"，标准做法是条件极值：目标 $d^{2}=x^{2}+y^{2}+z^{2}$，约束 $(x-y)^{2}-z^{2}=1$，用拉格朗日乘数法。但本题的曲面方程有个显眼的结构——它只通过 $x-y$ 这一个组合含 $x,y$。这提示可以**先降维**，把三元问题拆成两步：

第一步：固定 $u=x-y$ 与 $z$，在直线 $x-y=u$ 上使 $x^{2}+y^{2}$ 最小。这是一个初等问题：由 $x^{2}+y^{2}\geq\frac{(x-y)^{2}}{2}=\frac{u^{2}}{2}$（等号在 $x=-y=\frac u2$ 取到）。

第二步：剩下一元问题，在约束 $u^{2}-z^{2}=1$ 下极小化 $\frac{u^{2}}{2}+z^{2}$。用约束消 $u^{2}=1+z^{2}$，目标变成 $\frac12+\frac32z^{2}$，显然 $z=0$ 时最小。

这条路全程不用解方程组，比直接上拉格朗日快得多。之所以能这样，是因为约束里 $x,y$ 只以 $x-y$ 出现；一旦看到"变量只以某个组合出现"，就应该先做这种降维。用拉格朗日也能做，只是要多解一个四元方程组。

@解答
设 $S$ 上的点 $(x,y,z)$，所求为 $d=\sqrt{x^{2}+y^{2}+z^{2}}$ 的最小值，约束为
$$(x-y)^{2}-z^{2}=1 .$$
令 $u=x-y$。由基本不等式
$$x^{2}+y^{2}\geq\frac{(x-y)^{2}}{2}=\frac{u^{2}}{2} ,$$
等号当且仅当 $x=-y$，即 $x=\frac u2,\ y=-\frac u2$ 时成立。于是
$$d^{2}=x^{2}+y^{2}+z^{2}\geq\frac{u^{2}}{2}+z^{2} .$$
由约束 $u^{2}=1+z^{2}$，代入得
$$d^{2}\geq\frac{1+z^{2}}{2}+z^{2}=\frac12+\frac32z^{2}\geq\frac12 ,$$
等号当 $z=0$ 时成立。此时 $u^{2}=1$，取 $u=1$（$u=-1$ 对称），对应点
$$(\frac12,-\frac12,0) ,$$
可直接验证它在 $S$ 上：$(\frac12+\frac12)^{2}-0=1$。

故最短距离
$$d_{\min}=\sqrt{\frac12}=\frac{\sqrt2}{2} .$$

@考点
曲面上到定点的最短距离（条件极值）；用变量组合降维；基本不等式 $x^{2}+y^{2}\geq\frac{(x-y)^{2}}{2}$。

易混：目标函数用 $d^{2}$ 而不是 $d$，两者最小值点相同但 $d^{2}$ 可微且计算简单；这是条件极值题的通用处理。

@易错
1. 不检验所得点确实在 $S$ 上，或忽略曲面 $S$ 非空、最小值确实可达。
2. 用拉格朗日乘数法时把约束写成 $(x-y)^{2}+z^{2}=1$（把双曲柱面看成椭圆柱面），符号错导致答案变成 $z$ 取端点。
3. 由 $u^{2}=1+z^{2}$ 消元时忘了 $z$ 可取任意实数，误以为 $z$ 有上界。
4. 只求驻点不比较，直接把某个驻点当最小值。

[79]
@题目
设 $f'(0)$ 存在，$f(0)=0$，且
$$\lim_{x\to 0}\Big[1+\frac{1-\cos f(x)}{\sin x}\Big]^{\frac{1}{x}}=e$$
则 $f'(0)=$ ______.

@切入点
外层是 $1^{\infty}$ 型极限，先按标准套路取对数化成
$$\lim_{x\to0}\frac{1}{x}\cdot\frac{1-\cos f(x)}{\sin x}=1 \Longrightarrow \text{原式}=\mathrm e .$$
（这里用 $\lim[1+\alpha]^{\frac1x}=\mathrm e^{\lim\frac{\alpha}{x}}$，前提是 $\alpha\to0$，下面会顺带验证。）

接下来的关键是把条件 $f(0)=0$、$f'(0)$ 存在用到位。这两条合起来只给一件事：
$$f(x)=f'(0)x+o(x) (x\to0) ,$$
即 $f(x)\sim f'(0)x$（当 $f'(0)\neq0$）。注意只假设了 $f'(0)$ 存在，**没有**假设 $f$ 二阶可导、更没有 $f'$ 连续，所以不能对 $f$ 用洛必达或泰勒展到二阶——只能用这个一阶的可导定义。

再看内层：$1-\cos f(x)\sim\frac{f^{2}(x)}{2}$（等价无穷小，前提 $f(x)\to0$，由 $f$ 在 $0$ 可导即连续保证），$\sin x\sim x$。于是
$$\frac{1}{x}\cdot\frac{1-\cos f(x)}{\sin x}\to\frac{1}{x}\cdot\frac{f^{2}(x)/2}{x}=\frac12(\frac{f(x)}{x})^{2}\to\frac{f'(0)^{2}}{2} .$$
恰好把未知量 $f'(0)$ 逼出来。整道题的设计就是：用 $1-\cos$ 制造平方，再用可导定义 $\frac{f(x)-f(0)}{x-0}\to f'(0)$ 收尾——所以答案会出现 $\pm$。

@解答
因 $f$ 在 $x=0$ 可导，故 $f$ 在 $0$ 连续，$f(x)\to f(0)=0$，于是
$$1-\cos f(x)\sim\frac{f^{2}(x)}{2} , \sin x\sim x (x\to0) ,$$
从而
$$\frac{1-\cos f(x)}{\sin x}\to0 ,$$
原极限确为 $1^{\infty}$ 型。由
$$\lim_{x\to0}[1+\frac{1-\cos f(x)}{\sin x}]^{\frac1x}=\exp(\lim_{x\to0}\frac{1}{x}\cdot\frac{1-\cos f(x)}{\sin x}) ,$$
计算指数上的极限：
$$\lim_{x\to0}\frac{1-\cos f(x)}{x\sin x}=\lim_{x\to0}\frac{\frac12f^{2}(x)}{x\cdot x}=\frac12\lim_{x\to0}(\frac{f(x)-f(0)}{x-0})^{2}=\frac12[f'(0)]^{2} .$$
由题设原极限等于 $\mathrm e=\mathrm e^{1}$，故
$$\frac12[f'(0)]^{2}=1 , [f'(0)]^{2}=2 ,$$
$$f'(0)=\pm\sqrt2 .$$

@考点
$1^{\infty}$ 型极限的指数化处理；等价无穷小 $1-\cos u\sim\frac{u^{2}}{2}$、$\sin x\sim x$；导数定义 $\lim_{x\to0}\frac{f(x)-f(0)}{x}=f'(0)$ 的逆用。

易混：只知道"$f'(0)$ 存在"时，唯有导数定义这一个工具可用；洛必达法则要求在 $0$ 的某去心邻域内 $f'$ 存在，泰勒余项形式要求更高阶可导，本题都不满足。

@易错
1. 对 $\frac{1-\cos f(x)}{x\sin x}$ 用洛必达，出现 $f'(x)$ 在 $x\neq0$ 处的值——条件并未保证它存在。
2. 用 $1-\cos u\sim\frac{u^{2}}{2}$ 时忘记验证 $f(x)\to0$（若 $f(x)$ 不趋于 $0$，该等价式不成立）。
3. 只取正根，漏掉 $f'(0)=-\sqrt2$；注意 $f'(0)$ 是以平方形式进入的，两个符号都满足条件。
4. 把 $1^{\infty}$ 的极限写成 $\mathrm e^{\lim\frac{1-\cos f(x)}{\sin x}}$，漏掉外层指数 $\frac1x$。

[80]
@题目
设
$$A = \begin{bmatrix} 1 & 2 & 2 \\ 2 & 1 & 2 \\ 2 & 2 & 1 \end{bmatrix}$$
求：（Ⅰ）$A$ 的全部特征值和特征向量；（Ⅱ）可逆矩阵 $P$，使得 $P^{-1}AP = \Lambda$；（Ⅲ）正交矩阵 $Q$，使 $Q^{-1}AQ = \Lambda$.

@切入点
这个矩阵有非常强的结构：三条对角线上是 $1$，其余全是 $2$，可以写成
$$A=2J-E , J=\begin{pmatrix}1&1&1\\1&1&1\\1&1&1\end{pmatrix} .$$
$J$ 是秩 $1$ 的全 $1$ 矩阵，特征值一眼可见：$3,0,0$（$J$ 的每行和为 $3$，故 $(1,1,1)^{\mathrm T}$ 是特征向量；$r(J)=1$ 故 $0$ 是二重特征值）。由 $A=2J-E$ 立刻得 $A$ 的特征值 $2\cdot3-1=5$ 与 $2\cdot0-1=-1$（二重），特征向量与 $J$ 完全相同。

即使不用这个技巧，按常规展开 $|A-\lambda E|$ 也行：各行之和相等（都是 $5$），把第 $2,3$ 列加到第 $1$ 列即可提出公因子 $5-\lambda$——"行和相等"是这类矩阵的通用突破口。

第（Ⅲ）问要正交矩阵，比（Ⅱ）多一步：$A$ 是实对称矩阵，不同特征值的特征向量自动正交（$\xi_{1}$ 与 $\xi_{2},\xi_{3}$ 天然垂直，不必再正交化），**只需在二重特征值 $\lambda=-1$ 的特征子空间内部对 $\xi_{2},\xi_{3}$ 作施密特正交化**，最后全部单位化。认清"哪一部分需要正交化、哪一部分不需要"，能省掉大量计算。

@解答
（Ⅰ）注意 $A$ 每行元素之和都是 $5$。把第 $2,3$ 列加到第 $1$ 列：
$$|A-\lambda E|=\begin{vmatrix}1-\lambda&2&2\\2&1-\lambda&2\\2&2&1-\lambda\end{vmatrix}=\begin{vmatrix}5-\lambda&2&2\\5-\lambda&1-\lambda&2\\5-\lambda&2&1-\lambda\end{vmatrix}=(5-\lambda)\begin{vmatrix}1&2&2\\1&1-\lambda&2\\1&2&1-\lambda\end{vmatrix} .$$
再把第 $1$ 行的 $-1$ 倍加到第 $2,3$ 行：
$$=(5-\lambda)\begin{vmatrix}1&2&2\\0&-1-\lambda&0\\0&0&-1-\lambda\end{vmatrix}=(5-\lambda)(1+\lambda)^{2} .$$
故特征值为
$$\lambda_{1}=5 , \lambda_{2}=\lambda_{3}=-1 .$$

$\lambda_{1}=5$：
$$A-5E=\begin{pmatrix}-4&2&2\\2&-4&2\\2&2&-4\end{pmatrix}\longrightarrow\begin{pmatrix}1&0&-1\\0&1&-1\\0&0&0\end{pmatrix} ,$$
得 $\xi_{1}=(1,1,1)^{\mathrm T}$，全部特征向量为 $k\xi_{1} (k\neq0)$。

$\lambda_{2}=\lambda_{3}=-1$：
$$A+E=\begin{pmatrix}2&2&2\\2&2&2\\2&2&2\end{pmatrix}\longrightarrow\begin{pmatrix}1&1&1\\0&0&0\\0&0&0\end{pmatrix} ,$$
即 $x_{1}+x_{2}+x_{3}=0$，基础解系
$$\xi_{2}=(-1,1,0)^{\mathrm T} , \xi_{3}=(-1,0,1)^{\mathrm T} ,$$
全部特征向量为 $k_{2}\xi_{2}+k_{3}\xi_{3}$（$k_{2},k_{3}$ 不全为零）。

（Ⅱ）取
$$P=(\xi_{1},\xi_{2},\xi_{3})=\begin{pmatrix}1&-1&-1\\1&1&0\\1&0&1\end{pmatrix} ,$$
则
$$P^{-1}AP=\Lambda=\begin{pmatrix}5&&\\&-1&\\&&-1\end{pmatrix} .$$

（Ⅲ）$A$ 实对称，$\xi_{1}$ 与 $\xi_{2},\xi_{3}$ 已自动正交（$\xi_{1}\cdot\xi_{2}=\xi_{1}\cdot\xi_{3}=0$），只需把 $\xi_{2},\xi_{3}$ 施密特正交化：
$$\eta_{2}=\xi_{2}=(-1,1,0)^{\mathrm T} ,$$
$$\eta_{3}=\xi_{3}-\frac{(\xi_{3},\eta_{2})}{(\eta_{2},\eta_{2})}\eta_{2}=(-1,0,1)^{\mathrm T}-\frac12(-1,1,0)^{\mathrm T}=(-\frac12,-\frac12,1)^{\mathrm T} ,$$
取其 $2$ 倍 $\eta_{3}=(-1,-1,2)^{\mathrm T}$。单位化：
$$\gamma_{1}=\frac{1}{\sqrt3}(1,1,1)^{\mathrm T} , \gamma_{2}=\frac{1}{\sqrt2}(-1,1,0)^{\mathrm T} , \gamma_{3}=\frac{1}{\sqrt6}(-1,-1,2)^{\mathrm T} .$$
令
$$Q=(\gamma_{1},\gamma_{2},\gamma_{3})=\begin{pmatrix}\frac{1}{\sqrt3}&-\frac{1}{\sqrt2}&-\frac{1}{\sqrt6}\\ \frac{1}{\sqrt3}&\frac{1}{\sqrt2}&-\frac{1}{\sqrt6}\\ \frac{1}{\sqrt3}&0&\frac{2}{\sqrt6}\end{pmatrix} ,$$
则 $Q$ 为正交矩阵，且
$$Q^{-1}AQ=Q^{\mathrm T}AQ=\Lambda=\begin{pmatrix}5&&\\&-1&\\&&-1\end{pmatrix} .$$

@考点
行和相等的矩阵求特征值（列加法提公因子）；实对称矩阵不同特征值的特征向量必正交；施密特正交化与正交相似对角化 $Q^{-1}=Q^{\mathrm T}$。

易混：（Ⅱ）的 $P$ 只要求可逆，（Ⅲ）的 $Q$ 要求列向量两两正交且都是单位向量；$P$ 的列可以随便放缩，$Q$ 的不行。

@易错
1. 写"全部特征向量"时漏掉"$k\neq0$"或"$k_{2},k_{3}$ 不全为零"。
2. （Ⅲ）中把 $\xi_{1}$ 也拿去和 $\xi_{2},\xi_{3}$ 一起施密特正交化——多此一举且易算错。
3. 正交化后忘记单位化，得到的 $Q$ 不是正交矩阵。
4. $Q$ 的列与 $\Lambda$ 对角元次序不匹配。

[81]
@题目
设矩阵 $A_{5 \times 4}$ 的秩为 2，$\alpha_{1} = (1,1,2,3)^{\mathrm{T}}$，$\alpha_{2} = (-1,1,4,-1)^{\mathrm{T}}$，$\alpha_{3} = (5,-1,-8,9)^{\mathrm{T}}$ 是方程组 $Ax = 0$ 的解向量，求 $Ax = 0$ 的解空间的一组标准正交基.

@切入点
"求解空间的一组标准正交基"，分三步：定维数 $\to$ 挑基 $\to$ 正交化单位化。

第一步靠公式：$A$ 是 $5\times4$ 矩阵，未知数个数是 $4$（列数，不是行数 $5$），$r(A)=2$，故解空间维数
$$4-2=2 .$$
维数是 $2$，而题目给了 $3$ 个解向量，说明它们必线性相关——这就把第二步的任务变成"从三个里挑两个线性无关的"。

第二步只需验证 $\alpha_{1},\alpha_{2}$ 无关（分量不成比例即可），再顺手核对 $\alpha_{3}=2\alpha_{1}-3\alpha_{2}$ 确认相关性，于是 $\alpha_{1},\alpha_{2}$ 就是一组基。

第三步是标准的施密特正交化 $+$ 单位化。注意正交化过程中出现分数时，可以把整个向量乘一个非零常数化整（不改变方向，也不破坏正交性），最后再单位化，能大幅减少运算量。

@解答
$A$ 为 $5\times4$ 矩阵，$Ax=0$ 的未知数个数为 $4$，又 $r(A)=2$，故解空间的维数为
$$4-r(A)=4-2=2 .$$

$\alpha_{1}=(1,1,2,3)^{\mathrm T}$ 与 $\alpha_{2}=(-1,1,4,-1)^{\mathrm T}$ 对应分量不成比例，线性无关；又
$$2\alpha_{1}-3\alpha_{2}=(2+3,\ 2-3,\ 4-12,\ 6+3)^{\mathrm T}=(5,-1,-8,9)^{\mathrm T}=\alpha_{3} ,$$
故 $\alpha_{3}$ 可由 $\alpha_{1},\alpha_{2}$ 线性表示。于是 $\alpha_{1},\alpha_{2}$ 是解空间的一组基。

施密特正交化：
$$\beta_{1}=\alpha_{1}=(1,1,2,3)^{\mathrm T} , (\beta_{1},\beta_{1})=1+1+4+9=15 ,$$
$$(\alpha_{2},\beta_{1})=-1+1+8-3=5 ,$$
$$\beta_{2}=\alpha_{2}-\frac{(\alpha_{2},\beta_{1})}{(\beta_{1},\beta_{1})}\beta_{1}=(-1,1,4,-1)^{\mathrm T}-\frac13(1,1,2,3)^{\mathrm T}=(-\frac43,\frac23,\frac{10}{3},-2)^{\mathrm T} .$$
取其 $\frac32$ 倍（不改变方向）：
$$\beta_{2}=(-2,1,5,-3)^{\mathrm T} , (\beta_{2},\beta_{2})=4+1+25+9=39 .$$
（验证 $(\beta_{1},\beta_{2})=-2+1+10-9=0$。）

单位化得标准正交基
$$\gamma_{1}=\frac{1}{\sqrt{15}}(1,1,2,3)^{\mathrm T} , \gamma_{2}=\frac{1}{\sqrt{39}}(-2,1,5,-3)^{\mathrm T} .$$

@考点
齐次方程组解空间维数 $=n-r(A)$（$n$ 为未知数个数即列数）；基础解系的判定；施密特正交化与单位化。

易混：$5\times4$ 矩阵的 $n$ 是 $4$ 不是 $5$；若误用 $5-2=3$，会以为解空间三维、三个给定向量恰好是基，从而对三个向量做正交化，结果必然出错（它们线性相关，第三步会算出零向量）。

@易错
1. 把未知数个数取成行数 $5$，得到维数 $3$。
2. 不检查 $\alpha_{1},\alpha_{2},\alpha_{3}$ 的相关性，直接对三个向量施密特正交化。
3. 正交化中把系数写成 $\frac{(\beta_{1},\alpha_{2})}{(\alpha_{2},\alpha_{2})}$（分母应是 $(\beta_{1},\beta_{1})$）。
4. 只正交化不单位化，交出的不是"标准"正交基。

[82]
@题目
设 $S$ 为 $z=x^2+y^2$ 介于 $z=0$ 与 $z=1$ 之间部分的下侧，计算
$$I=\iint_S x^2\,dydz+z\,dxdy$$

@切入点
被积式是 $x^{2}dydz+z dxdy$，两项的面元不同，曲面又是旋转抛物面，直接投影要分片（$dydz$ 投影到 $yOz$ 面时抛物面分成 $x>0$、$x<0$ 两半），麻烦。有两条路：

路线一：统一投影法。曲面可写成显式 $z=x^{2}+y^{2}$，对这种显式曲面有
$$dydz=-z_{x}dxdy , dzdx=-z_{y}dxdy ,$$
把三项一次性化到同一个 $dxdy$ 上，全部投到 $xOy$ 面的圆盘 $x^{2}+y^{2}\leq1$，取下侧就整体加负号。这条路只需一次投影，不用分片。

路线二：高斯公式。$S$ 不封闭，补上顶盖 $S_{1}: z=1,\ x^{2}+y^{2}\leq1$ 取上侧。注意 $S$ 的下侧正是所围区域 $\Omega:x^{2}+y^{2}\leq z\leq1$ 的**外侧**，方向天然匹配，补面后可直接用高斯公式；散度只有 $2x+1$，其中 $2x$ 在对称区域上积分为零，剩下就是体积。

两条路计算量相当，下面主用路线一，用路线二复核。

@解答
解法一（化为对 $xOy$ 的投影）。$S:z=x^{2}+y^{2}$，投影区域 $D:x^{2}+y^{2}\leq1$，且 $z_{x}=2x$。对显式曲面 $z=z(x,y)$ 有 $dydz=-z_{x}dxdy$，取下侧时整体加负号：
$$I=\iint_{S}x^{2}dydz+z dxdy=-\iint_{D}[-x^{2}\cdot z_{x}+z]dxdy=-\iint_{D}[-2x^{3}+(x^{2}+y^{2})]dxdy .$$
$D$ 关于 $y$ 轴对称，$-2x^{3}$ 是 $x$ 的奇函数，故该项积分为零。用极坐标：
$$\iint_{D}(x^{2}+y^{2})dxdy=\int_{0}^{2\pi}d\theta\int_{0}^{1}r^{2}\cdot r dr=2\pi\cdot\frac14=\frac{\pi}{2} .$$
故
$$I=-\frac{\pi}{2} .$$

解法二（高斯公式复核）。补 $S_{1}:z=1 (x^{2}+y^{2}\leq1)$ 取上侧，则 $S+S_{1}$ 是闭曲面 $\partial\Omega$ 的外侧，其中
$$\Omega: x^{2}+y^{2}\leq z\leq1 .$$
取 $P=x^{2},Q=0,R=z$，$\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z}=2x+1$，由高斯公式
$$\oiint_{S+S_{1}}=\iiint_{\Omega}(2x+1)dV=0+V(\Omega) ,$$
（$\Omega$ 关于 $yOz$ 面对称，$2x$ 的积分为零），而
$$V(\Omega)=\int_{0}^{2\pi}d\theta\int_{0}^{1}r dr\int_{r^{2}}^{1}dz=2\pi\int_{0}^{1}r(1-r^{2})dr=2\pi(\frac12-\frac14)=\frac{\pi}{2} .$$
在 $S_{1}$ 上 $z\equiv1$，其法向量为 $(0,0,1)$，故 $dydz$ 那一项贡献为零：
$$\iint_{S_{1}}x^{2}dydz+z dxdy=0+\iint_{D}1 dxdy=\pi .$$
于是
$$I=\frac{\pi}{2}-\pi=-\frac{\pi}{2} ,$$
与解法一一致。

@考点
第二类曲面积分的两种算法：显式曲面的"合一投影"公式 $dydz=-z_{x}dxdy,\ dzdx=-z_{y}dxdy$；高斯公式的补面法及方向判定；奇偶对称性化简。

易混：只有把曲面写成 $z=z(x,y)$ 这种显式形式时才能用 $dydz=-z_{x}dxdy$；若要对 $x=x(y,z)$ 投影，公式形式不同。另外"下侧"对应的是投影后整体取负号，而不是把某一项取负。

@易错
1. 把 $x^{2}dydz$ 直接投到 $yOz$ 面而不分 $x>0,x<0$ 两片，漏掉一半或符号错。
2. 侧向判断错：把 $S$ 的下侧当成 $\Omega$ 的内侧，用高斯公式时符号整体反了。
3. 补面时给 $S_{1}$ 取了下侧，或忘记最后减去 $\iint_{S_{1}}$。
4. 忽略 $-2x^{3}$ 的奇对称性，白算一遍还容易算错。

[83]
@题目
设随机变量 $X$ 服从参数为 $\lambda$ 的指数分布，对 $X$ 进行三次独立重复观察，至少有一次观测值大于 3 的概率为 $\dfrac{26}{27}$，求 $\lambda$ 的值.

@切入点
题面有两层随机性，必须分清：

内层是连续型随机变量 $X\sim E(\lambda)$，它决定单次观察"成功"（观测值大于 $3$）的概率
$$p=P(X>3)=\mathrm e^{-3\lambda} .$$
外层是三次独立重复观察，即 $n=3$ 的伯努利试验，"至少一次"用对立事件最省事：
$$P(\text{至少一次}>3)=1-(1-p)^{3} .$$

所以整道题的骨架是"指数分布算单次概率 $\to$ 二项分布套外壳"。一旦写成 $1-(1-\mathrm e^{-3\lambda})^{3}=\frac{26}{27}$，剩下就是解方程：$(1-\mathrm e^{-3\lambda})^{3}=\frac{1}{27}$，开三次方得 $1-\mathrm e^{-3\lambda}=\frac13$，注意 $\frac{1}{27}$ 写成 $(\frac13)^{3}$ 是出题人埋好的提示。

@解答
设 $X\sim E(\lambda)$（$\lambda>0$），其分布函数为
$$F(x)=\begin{cases}1-\mathrm e^{-\lambda x}, & x\geq0,\\ 0,& x<0.\end{cases}$$
单次观察中"观测值大于 $3$"的概率为
$$p=P(X>3)=1-F(3)=\mathrm e^{-3\lambda} .$$
三次观察相互独立，记 $Y$ 为三次中观测值大于 $3$ 的次数，则 $Y\sim B(3,p)$。由对立事件
$$P(Y\geq1)=1-P(Y=0)=1-(1-p)^{3} .$$
依题意
$$1-(1-\mathrm e^{-3\lambda})^{3}=\frac{26}{27} ,$$
即
$$(1-\mathrm e^{-3\lambda})^{3}=\frac{1}{27}=(\frac13)^{3} ,$$
$$1-\mathrm e^{-3\lambda}=\frac13 , \mathrm e^{-3\lambda}=\frac23 ,$$
$$-3\lambda=\ln\frac23 , \lambda=\frac13\ln\frac32 .$$

@考点
指数分布的尾概率 $P(X>a)=\mathrm e^{-\lambda a} (a>0)$；$n$ 重伯努利试验与二项分布；"至少一次"用对立事件计算。

易混：不要把 $P(X>3)$ 写成 $1-\mathrm e^{-3\lambda}$（那是 $P(X\leq3)$）；指数分布的"生存函数"才是 $\mathrm e^{-\lambda x}$。

@易错
1. 尾概率取反，得到 $p=1-\mathrm e^{-3\lambda}$，最终答案变成 $\lambda=\frac13\ln3$。
2. 把"至少一次"算成 $3p$ 或直接算 $P(Y=1)$。
3. 开三次方时写成 $1-\mathrm e^{-3\lambda}=\frac{1}{27}$，少开一次方。
4. 最后忘了解出 $\lambda$，停在 $\mathrm e^{-3\lambda}=\frac23$；或把 $\lambda=\frac13\ln\frac32$ 写成 $\frac13\ln\frac23$（负数，不合 $\lambda>0$）。
