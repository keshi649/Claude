[1]
@题目
设
$$f(x,y)=\begin{cases}x\sin\dfrac{1}{y}+y\sin\dfrac{1}{x}, & xy\neq 0,\\ 0, & xy=0,\end{cases}$$
则下列选项中正确的是（　）.
A. $\lim\limits_{x\to 0}\lim\limits_{y\to 0}f(x,y)=0$　　B. $\lim\limits_{y\to 0}\lim\limits_{x\to 0}f(x,y)=0$
C. $f'_x(0,0)$ 与 $f'_y(0,0)$ 均不存在　　D. $f(x,y)$ 在点 $(0,0)$ 处连续

@切入点
四个选项分别考"累次极限、偏导数、连续性"三件不同的事，必须逐个用各自的定义去验，不能互相替代。

先看函数的结构：$x\sin\frac1y+y\sin\frac1x$，两项都是"无穷小 $\times$ 有界量"，但**有界的那个因子在原点附近剧烈振荡、没有极限**。这一句话决定了全部答案的走向：

- **累次极限（A、B）**：$\lim\limits_{y\to0}f(x,y)$ 是先固定 $x\neq0$ 再让 $y\to0$，此时 $x$ 是一个**非零常数**，$x\sin\frac1y$ 在 $\pm|x|$ 之间反复振荡，内层极限就**不存在**，外层更无从谈起。所以 A、B 都错。注意这里的陷阱：固定的 $x$ 不是无穷小，不能拿它去"压住"振荡。
- **偏导数（C）**：偏导数是沿坐标轴方向算的，而在坐标轴上（$xy=0$）函数恒为 $0$，所以 $f(x,0)\equiv0$，$f'_x(0,0)=0$ 存在。C 错。这提醒我们：分段函数在分界点求偏导，一定要**回到定义**并沿着坐标轴取值。
- **连续性（D）**：二重极限允许 $x,y$ **同时**趋于 $0$，此时两项都是"无穷小 $\times$ 有界"，用夹逼 $|f|\leqslant|x|+|y|\to0$ 立得连续。

这道题的价值就在于展示：二重极限存在（连续）与累次极限存在**互不蕴含**。

@解答
A、B 错误。固定 $x\neq0$，当 $y\to0$ 时 $x\sin\dfrac1y$ 在 $[-|x|,|x|]$ 内振荡而无极限，$y\sin\dfrac1x\to0$，故 $\lim\limits_{y\to0}f(x,y)$ 不存在，累次极限 $\lim\limits_{x\to0}\lim\limits_{y\to0}f(x,y)$ 不存在。同理另一个累次极限也不存在。

C 错误。当 $y=0$ 时 $xy=0$，故 $f(x,0)\equiv0$，于是
$$f'_x(0,0)=\lim_{x\to0}\frac{f(x,0)-f(0,0)}{x}=\lim_{x\to0}\frac{0-0}{x}=0 ,$$
存在；同理 $f'_y(0,0)=0$ 存在。

D 正确。当 $xy\neq0$ 时
$$|f(x,y)|=|x\sin\frac1y+y\sin\frac1x|\leqslant|x|+|y| ,$$
当 $xy=0$ 时 $f=0$ 也满足该估计。由夹逼准则
$$\lim_{(x,y)\to(0,0)}f(x,y)=0=f(0,0),$$
故 $f$ 在 $(0,0)$ 处连续。

选 **D**。

@考点
二重极限与累次极限的区别；分段函数在分界点处偏导数的定义求法；夹逼准则证明二元函数连续；"无穷小乘有界量仍是无穷小"。

易混：二重极限存在**不能**推出累次极限存在（本题就是反例），反之累次极限存在也推不出二重极限存在；只有当二重极限与某个累次极限都存在时，二者才相等。

@易错
1. 认为 $\sin\frac1y$ 有界就能保证 $\lim\limits_{y\to0}x\sin\frac1y=0$——只有 $x$ 同时趋于 $0$ 时才行，累次极限里 $x$ 是固定的非零数。
2. 求 $f'_x(0,0)$ 时对表达式 $x\sin\frac1y+y\sin\frac1x$ 直接求导再代入（该表达式在 $(0,0)$ 处根本用不上）。
3. 由"偏导数存在"推"连续"或反之（二元函数中两者互不蕴含）。

[2]
@题目
求形如 $\sum\limits_{n=1}^{\infty} b_n \sin nx$ 的级数，使其在 $(0, \pi)$ 内的和函数为 $\dfrac{1}{2}(\pi - x)$，当 $x = \dfrac{\pi}{2}$ 时，求此级数的和.

@切入点
题目要求的是形如 $\sum b_n\sin nx$ 的级数，即**只含正弦项**——这正是把函数展开成**正弦级数**（对应奇延拓）。所以任务是：把 $\dfrac{\pi-x}{2}$ 在 $(0,\pi)$ 上作奇延拓，求其傅里叶系数
$$b_n=\frac{2}{\pi}\int_{0}^{\pi}\frac{\pi-x}{2}\sin nx dx .$$
注意只需算 $b_n$，$a_n$ 全为零是奇延拓自动保证的，不必计算。

计算 $\int_0^\pi(\pi-x)\sin nx dx$ 时拆成两块：$\pi\int\sin nx$ 与 $\int x\sin nx$，后者用分部积分。有意思的是两块中含 $(-1)^n$ 的部分正好抵消，结果干净地得到 $\frac\pi n$，于是 $b_n=\frac1n$——这也是这个展开式之所以是经典结论的原因。

第二问只需在**和函数等于原函数的点**上代入。$x=\frac\pi2$ 是 $(0,\pi)$ 的内点，且延拓后的函数在该点连续，所以级数和就等于 $\frac{\pi-\frac\pi2}{2}=\frac\pi4$，顺带得到莱布尼茨级数 $1-\frac13+\frac15-\cdots=\frac\pi4$。

@解答
把 $\dfrac{\pi-x}{2}$ 在 $(0,\pi)$ 上作奇延拓并展开成正弦级数，系数为
$$b_n=\frac{2}{\pi}\int_{0}^{\pi}\frac{\pi-x}{2}\sin nx dx=\frac1\pi\int_{0}^{\pi}(\pi-x)\sin nx dx .$$
其中
$$\int_{0}^{\pi}\pi\sin nx dx=\pi\cdot\frac{1-(-1)^{n}}{n}, 
\int_{0}^{\pi}x\sin nx dx=[-\frac{x\cos nx}{n}]_{0}^{\pi}+\frac1n\int_{0}^{\pi}\cos nx dx=-\frac{\pi(-1)^{n}}{n} .$$
故
$$\int_{0}^{\pi}(\pi-x)\sin nx dx=\frac{\pi(1-(-1)^{n})}{n}+\frac{\pi(-1)^{n}}{n}=\frac{\pi}{n},  b_n=\frac1n .$$
所求级数为
$$\sum_{n=1}^{\infty}\frac{\sin nx}{n}=\frac{\pi-x}{2},  0<x<\pi .$$

当 $x=\dfrac\pi2$ 时，该点是连续点，故级数收敛于函数值：
$$\sum_{n=1}^{\infty}\frac{\sin\frac{n\pi}{2}}{n}=1-\frac13+\frac15-\frac17+\cdots=\frac{\pi-\frac\pi2}{2}=\frac\pi4 .$$

@考点
傅里叶正弦级数（奇延拓）与系数公式 $b_n=\frac2\pi\int_0^\pi f(x)\sin nx dx$；狄利克雷收敛定理（连续点处级数收敛于函数值）；由傅里叶展开求特殊数项级数的和。

易混：正弦级数对应**奇**延拓（$a_n=0$），余弦级数对应**偶**延拓（$b_n=0$）；题目要求"形如 $\sum b_n\sin nx$"就是在指定奇延拓。

@易错
1. 用一般傅里叶级数的公式（周期 $2\pi$、区间 $[-\pi,\pi]$），系数公式中的因子写错。
2. 分部积分时 $\int_0^\pi x\sin nx dx$ 的符号或 $(-1)^n$ 出错。
3. 在 $x=\frac\pi2$ 处代入时忘了这是连续点（若代入端点 $x=0$ 或 $\pi$，级数收敛到 $0$，不等于函数值，需按狄利克雷定理取左右极限的平均）。
4. 漏掉收敛区间 $0<x<\pi$。

[3]
@题目
设 $A$ 是 $n$ 阶实对称矩阵，$B$ 是 $n$ 阶实矩阵，若对任意 $n$ 维非零列向量 $\alpha$，都有 $\alpha^{\mathrm{T}}(AB + B^{\mathrm{T}}A)\alpha > 0$，则下列选项中正确的是（　　）.
A. 方程组 $ABX = \alpha$ 有无穷多解　B. 方程组 $ABX = \alpha$ 无解
C. 方程组 $AX = \alpha$ 有唯一解　D. 方程组 $AX = \alpha$ 无解

@切入点
条件是"对一切非零 $\alpha$ 有 $\alpha^{\mathrm T}(AB+B^{\mathrm T}A)\alpha>0$"，即矩阵 $AB+B^{\mathrm T}A$ 正定。但四个选项问的都是**方程组的解**，所以必须把这个正定条件翻译成关于 $A$（或 $AB$）的**秩／可逆性**信息。

翻译的办法是：正定意味着这个二次型永不为零，那么"什么时候它会为零"就是突破口。利用 $A$ 对称（$A^{\mathrm T}=A$）把二次型改写：
$$\alpha^{\mathrm T}AB\alpha=(A\alpha)^{\mathrm T}(B\alpha),  \alpha^{\mathrm T}B^{\mathrm T}A\alpha=(B\alpha)^{\mathrm T}(A\alpha),$$
两者是同一个数，故
$$\alpha^{\mathrm T}(AB+B^{\mathrm T}A)\alpha=2(A\alpha)\cdot(B\alpha) .$$
这个表达式里**含有因子 $A\alpha$**：一旦某个 $\alpha\neq0$ 使 $A\alpha=0$，整个式子就是 $0$，与正定矛盾。所以 $AX=0$ 只有零解，$A$ 可逆。

$A$ 可逆立刻给出"$AX=\alpha$ 有唯一解"，即选项 C。（注意 $B$ 未必可逆，所以关于 $ABX=\alpha$ 的 A、B 两个选项都不能确定。）

@解答
因 $A$ 是实对称矩阵，$A^{\mathrm T}=A$，故对任意 $\alpha$，
$$\alpha^{\mathrm T}AB\alpha=(A^{\mathrm T}\alpha)^{\mathrm T}(B\alpha)=(A\alpha)^{\mathrm T}(B\alpha), 
\alpha^{\mathrm T}B^{\mathrm T}A\alpha=(B\alpha)^{\mathrm T}(A\alpha) ,$$
二者互为转置且都是数，因此相等。于是
$$\alpha^{\mathrm T}(AB+B^{\mathrm T}A)\alpha=2(A\alpha)^{\mathrm T}(B\alpha) .$$

若 $AX=0$ 有非零解 $\alpha_0\neq0$，则 $A\alpha_0=0$，从而
$$\alpha_0^{\mathrm T}(AB+B^{\mathrm T}A)\alpha_0=2\cdot0=0 ,$$
与题设"对任意非零 $\alpha$ 该值大于 $0$"矛盾。故 $AX=0$ 只有零解，即 $\mathrm r(A)=n$，$A$ 可逆。

因此对任意 $\alpha$，方程组 $AX=\alpha$ 有唯一解 $X=A^{-1}\alpha$。选 **C**。

@考点
正定二次型的定义；实对称矩阵的转置性质在二次型化简中的运用；$A$ 可逆 $\Leftrightarrow AX=0$ 只有零解 $\Leftrightarrow AX=b$ 对任意 $b$ 有唯一解。

易混：本题只能断定 $A$ 可逆，**不能**断定 $B$ 或 $AB$ 可逆；A、B 两个选项关于 $ABX=\alpha$ 的断言都无法确定。

@易错
1. 不化简二次型，直接对 $AB+B^{\mathrm T}A$ 讨论，找不到突破口。
2. 忘记用 $A$ 的对称性（这是把 $\alpha^{\mathrm T}A$ 变成 $(A\alpha)^{\mathrm T}$ 的依据）。
3. 由正定推出 $AB+B^{\mathrm T}A$ 可逆后就止步，没有继续推到 $A$ 可逆。
4. 误以为 $AB$ 也正定或可逆。

[4]
@题目
设二阶线性非齐次微分方程 $y'' + p(x)y' + q(x)y = f(x)$ 有三个特解为 $x,\ e^x,\ e^{-x}$，则该方程的通解为 ＿＿＿＿.

@切入点
线性非齐次方程的解有一条铁律：**两个非齐次解之差是齐次解**。题目给了三个特解，那就能造出两个齐次解：
$$\mathrm e^{x}-x,  \mathrm e^{-x}-x .$$
二阶方程的通解只需要两个线性无关的齐次解加一个特解，所以材料已经够了，关键是**验证这两个齐次解线性无关**。

验证的最快办法不是算朗斯基行列式，而是直接看：若
$$C_1(\mathrm e^{x}-x)+C_2(\mathrm e^{-x}-x)\equiv0 ,$$
即 $C_1\mathrm e^{x}+C_2\mathrm e^{-x}-(C_1+C_2)x\equiv0$，而 $\mathrm e^{x},\mathrm e^{-x},x$ 这三个函数线性无关，故 $C_1=C_2=0$。

于是通解 $=$ 一个特解 $+$ 齐次通解，取最简单的特解 $x$ 即可。注意方程的 $p(x),q(x),f(x)$ 全都不需要求出来——这正是"解的结构"型题目的特点。

@解答
设 $y_1=x$，$y_2=\mathrm e^{x}$，$y_3=\mathrm e^{-x}$ 均为
$$y''+p(x)y'+q(x)y=f(x)$$
的特解。则 $y_2-y_1=\mathrm e^{x}-x$ 与 $y_3-y_1=\mathrm e^{-x}-x$ 都是对应齐次方程的解。

它们线性无关：设 $C_1(\mathrm e^{x}-x)+C_2(\mathrm e^{-x}-x)\equiv0$，即
$$C_1\mathrm e^{x}+C_2\mathrm e^{-x}-(C_1+C_2)x\equiv0 ,$$
由 $\mathrm e^{x},\mathrm e^{-x},x$ 线性无关得 $C_1=C_2=0$。

故齐次方程的通解为 $C_1(\mathrm e^{x}-x)+C_2(\mathrm e^{-x}-x)$，原方程的通解为
$$y=x+C_1(\mathrm e^{x}-x)+C_2(\mathrm e^{-x}-x),$$
其中 $C_1,C_2$ 为任意常数。

@考点
二阶线性非齐次方程解的结构：通解 $=$ 齐次通解 $+$ 一个特解；两个非齐次解之差为齐次解；二阶齐次方程的解空间是二维的，需两个线性无关解。

易混：不要把 $\mathrm e^{x},\mathrm e^{-x}$ 本身当成齐次解——它们是**非齐次**方程的解；只有它们的差才落到齐次方程里。

@易错
1. 直接写 $y=C_1\mathrm e^{x}+C_2\mathrm e^{-x}+x$，这恰恰是最常见的错误（它对应的是"$\mathrm e^{\pm x}$ 为齐次解"的情形）。
2. 忘记验证两个齐次解线性无关。
3. 把三个特解的任意组合当作通解而不加约束（组合系数之和须为 $1$ 才仍是非齐次解）。

[5]
@题目
设向量 $a=(-1,3,0)$，$b=(3,1,0)$，$|c|=r$（常数）。当 $c$ 满足 $a=b\times c$ 时，$r$ 的最小值为________.

@切入点
条件 $\mathbf a=\mathbf b\times\mathbf c$ 给出的是一个**向量方程**，要从中挤出关于 $|\mathbf c|$ 的信息，最自然的一步是**两边取模**，用叉积的模长公式：
$$|\mathbf a|=|\mathbf b||\mathbf c|\sin\langle\mathbf b,\mathbf c\rangle\leqslant|\mathbf b||\mathbf c| .$$
这是一个不等式，立刻给出 $|\mathbf c|$ 的**下界**：
$$r=|\mathbf c|\geqslant\frac{|\mathbf a|}{|\mathbf b|} .$$
所以最小值的候选就是 $\frac{|\mathbf a|}{|\mathbf b|}$，而且等号成立的条件非常明确：$\sin\langle\mathbf b,\mathbf c\rangle=1$，即 $\mathbf c\perp\mathbf b$。

和所有"放缩求最值"的题一样，最后**必须验证等号能取到**，即确实存在这样的 $\mathbf c$。这里还要先检查方程本身相容：叉积 $\mathbf b\times\mathbf c$ 必须垂直于 $\mathbf b$，所以必须有 $\mathbf a\perp\mathbf b$——算一下 $\mathbf a\cdot\mathbf b=-3+3=0$，相容。

@解答
先验证方程相容：$\mathbf b\times\mathbf c\perp\mathbf b$，故必须 $\mathbf a\perp\mathbf b$。而
$$\mathbf a\cdot\mathbf b=(-1)\cdot3+3\cdot1+0=0 ,$$
条件相容。

两边取模：$|\mathbf a|=|\mathbf b||\mathbf c|\sin\langle\mathbf b,\mathbf c\rangle\leqslant|\mathbf b||\mathbf c|$。又
$$|\mathbf a|=\sqrt{1+9}=\sqrt{10},  |\mathbf b|=\sqrt{9+1}=\sqrt{10} ,$$
故
$$\sqrt{10}\leqslant\sqrt{10} r\Longrightarrow r\geqslant1 .$$

等号当且仅当 $\mathbf c\perp\mathbf b$ 时成立。取 $\mathbf c=(0,0,-1)$，则
$$\mathbf b\times\mathbf c=\begin{vmatrix}\mathbf i&\mathbf j&\mathbf k\\3&1&0\\0&0&-1\end{vmatrix}=(-1,3,0)=\mathbf a ,$$
且 $|\mathbf c|=1$。故
$$r_{\min}=1 .$$

@考点
向量积的模长公式 $|\mathbf b\times\mathbf c|=|\mathbf b||\mathbf c|\sin\theta$；叉积与两因子都垂直；"取模放缩 $+$ 验证等号"求最值。

易混：$|\mathbf b\times\mathbf c|\leqslant|\mathbf b||\mathbf c|$ 与数量积的 $|\mathbf b\cdot\mathbf c|\leqslant|\mathbf b||\mathbf c|$ 形式相同但取等条件相反：前者要求垂直，后者要求平行。

@易错
1. 只放缩不验证等号可达，得到的只是下界。
2. 忘记先检验 $\mathbf a\perp\mathbf b$（否则方程无解，问题本身不成立）。
3. 把叉积的模长公式记成 $\cos$。
4. 试图把 $\mathbf c=(c_1,c_2,c_3)$ 设出来解方程组——可行，但会发现 $c_3$ 由方程确定而 $c_1,c_2$ 只受一个约束，讨论反而麻烦。

[6]
@题目
二次型 $f(x_1,x_2,x_3)=(x_1-x_2)^2+(x_2-x_3)^2+(x_3-x_1)^2$ 的标准形为（　　）.
A. $f=y_1^2+y_2^2+y_3^2$
B. $f=2y_1^2+\dfrac{3}{2}y_2^2$
C. $f=y_1^2+y_2^2-y_3^2$
D. $f=2y_1^2+\dfrac{3}{2}y_2^2+y_3^2$

@切入点
求二次型的标准形，本质是求出**正、负惯性指数和秩**（标准形本身不唯一，但这三个数是不变的），所以四个选项其实是在考"平方项的个数与符号"。

有两条路：

1. **配方法**：直接对 $f$ 配方，得到的就是一个标准形，可以和选项逐一比对。本题配方很顺：$f$ 展开后 $=2x_1^{2}+2x_2^{2}+2x_3^{2}-2x_1x_2-2x_2x_3-2x_3x_1$，先凑 $x_1$。
2. **特征值法**：写出矩阵 $A$，求特征值。本题 $A$ 是典型的"对角 $2$、非对角 $-1$"矩阵，特征值可以秒算：$(1,1,1)^{\mathrm T}$ 对应 $\lambda=0$，另外两个都是 $3$。

但其实有更快的**结构观察**：$f$ 是三个平方之和，显然 $f\geqslant0$（半正定），所以标准形里不可能出现负项，C 立即排除；又取 $x_1=x_2=x_3$ 时 $f=0$ 而向量非零，说明 $f$ **不是**正定的，故秩 $<3$，A、D（都含三个非零系数）排除。只剩 B。

这个"先判半正定、再看是否退化"的路子几秒钟就能选出答案，是选择题的最优解法；下面同时给出配方法的完整过程。

@解答
展开：
$$f=(x_1-x_2)^{2}+(x_2-x_3)^{2}+(x_3-x_1)^{2}=2x_1^{2}+2x_2^{2}+2x_3^{2}-2x_1x_2-2x_2x_3-2x_3x_1 .$$

先作结构判断：$f$ 为三个平方之和，故 $f\geqslant0$，标准形中不含负项，排除 C；又取 $x_1=x_2=x_3=1\neq0$ 得 $f=0$，故 $f$ 非正定，秩 $\leqslant2$，排除 A、D。

配方验证：
$$f=2[x_1^{2}-x_1(x_2+x_3)]+2x_2^{2}+2x_3^{2}-2x_2x_3=2[x_1-\frac{x_2+x_3}{2}]^{2}-\frac{(x_2+x_3)^{2}}{2}+2x_2^{2}+2x_3^{2}-2x_2x_3$$
$$=2[x_1-\frac{x_2+x_3}{2}]^{2}+\frac32x_2^{2}+\frac32x_3^{2}-3x_2x_3=2[x_1-\frac{x_2+x_3}{2}]^{2}+\frac32(x_2-x_3)^{2} .$$
令 $y_1=x_1-\dfrac{x_2+x_3}{2}$，$y_2=x_2-x_3$，$y_3=x_3$（保证变换可逆），则
$$f=2y_1^{2}+\frac32y_2^{2} .$$
（用特征值法亦可：$A=\begin{pmatrix}2&-1&-1\\-1&2&-1\\-1&-1&2\end{pmatrix}$ 的特征值为 $0,3,3$，秩为 $2$、正惯性指数为 $2$。）

故选 **B**。

@考点
二次型的标准形与配方法；秩、正负惯性指数是合同不变量；半正定的判定；特征值法求标准形。

易混：标准形**不唯一**（系数可以不同），唯一的是平方项个数（秩）和正负项个数（惯性指数）；所以做选择题时应当比对"几正几负"，而不是比对具体系数。

@易错
1. 认为标准形必须是 $y_1^2+y_2^2$ 这种规范形，从而排除掉系数为 $2$、$\frac32$ 的 B。
2. 没发现 $f$ 退化（秩为 $2$），选了含三项的 D。
3. 配方时漏掉 $-\frac{(x_2+x_3)^2}{2}$ 这一项。
4. 令新变量时忘了补 $y_3$，导致变换不可逆。

[7]
@题目
设 $f(u)$ 有连续导数，$S$ 为 $z=\sqrt{x^2+y^2}$ 与两个半球面 $z=\sqrt{1-x^2-y^2}$、$z=\sqrt{4-x^2-y^2}$ 所围立体全表面的外侧，计算
$$I=\oiint_S \Big[\frac{1}{y+3}f\Big(\frac{x+4}{y+3}\Big)+3xy^2\Big]dydz+\Big[\frac{1}{x+4}f\Big(\frac{x+4}{y+3}\Big)+3x^2y\Big]dzdx+z^3\,dxdy$$

@切入点
$S$ 是**闭曲面**且取外侧，被积的是第二类曲面积分——高斯公式几乎是唯一选择。何况被积函数里有抽象函数 $f$，根本无法在曲面上直接参数化。

动手前先算散度，这是决定成败的一步：
$$\frac{\partial P}{\partial x}=\frac{f'}{(y+3)^{2}}+3y^{2},  \frac{\partial Q}{\partial y}=-\frac{f'}{(y+3)^{2}}+3x^{2},  \frac{\partial R}{\partial z}=3z^{2} .$$
两个含 $f'$ 的项**符号相反、正好抵消**——这正是题目把 $\frac{1}{y+3}f(\frac{x+4}{y+3})$ 和 $\frac{1}{x+4}f(\frac{x+4}{y+3})$ 这样精心配对的用意。于是
$$\mathrm{div}=3(x^{2}+y^{2}+z^{2}) ,$$
被积函数只依赖到原点的距离。

再看区域：由两个半球面 $r=1$、$r=2$ 与锥面 $z=\sqrt{x^{2}+y^{2}}$ 围成，这是一个"球壳被锥面切出的一块"。被积函数是 $r$ 的函数、区域用球坐标描述最自然，所以球坐标是唯一合理的选择：
$$1\leqslant r\leqslant2,  0\leqslant\varphi\leqslant\frac\pi4,  0\leqslant\theta\leqslant2\pi ,$$
其中 $\varphi$ 的上限 $\frac\pi4$ 来自锥面 $z=\sqrt{x^{2}+y^{2}}$（半顶角 $45^{\circ}$）。体积元 $dV=r^{2}\sin\varphi drd\varphi d\theta$。三个积分完全分离，直接相乘。

@解答
记
$$P=\frac{1}{y+3}f(\frac{x+4}{y+3})+3xy^{2},  Q=\frac{1}{x+4}f(\frac{x+4}{y+3})+3x^{2}y,  R=z^{3} .$$
则
$$\frac{\partial P}{\partial x}=\frac{1}{(y+3)^{2}}f'(\frac{x+4}{y+3})+3y^{2},$$
$$\frac{\partial Q}{\partial y}=\frac{1}{x+4}\cdot f'(\frac{x+4}{y+3})\cdot(-\frac{x+4}{(y+3)^{2}})+3x^{2}=-\frac{1}{(y+3)^{2}}f'(\frac{x+4}{y+3})+3x^{2},$$
$$\frac{\partial R}{\partial z}=3z^{2} .$$
含 $f'$ 的两项相消，故
$$\mathrm{div}=\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z}=3(x^{2}+y^{2}+z^{2}) .$$

由高斯公式（$S$ 取外侧，$\Omega$ 为所围立体）
$$I=\iiint_{\Omega}3(x^{2}+y^{2}+z^{2})dV .$$
用球坐标（半径记为 $r$）：$\Omega$ 为 $1\leqslant r\leqslant2$，$0\leqslant\varphi\leqslant\dfrac\pi4$，$0\leqslant\theta\leqslant2\pi$，$dV=r^{2}\sin\varphi drd\varphi d\theta$，于是
$$I=3\int_{0}^{2\pi}d\theta\int_{0}^{\frac\pi4}\sin\varphi d\varphi\int_{1}^{2}r^{4}dr
=3\cdot2\pi\cdot(1-\frac{\sqrt2}{2})\cdot\frac{2^{5}-1}{5} .$$
计算得
$$I=6\pi\cdot\frac{31}{5}\cdot(1-\frac{\sqrt2}{2})=\frac{93\pi}{5}(2-\sqrt2) .$$

@考点
高斯（散度）公式；抽象函数的偏导计算；球坐标下的三重积分，体积元 $r^{2}\sin\varphi drd\varphi d\theta$；锥面 $z=\sqrt{x^{2}+y^{2}}$ 对应 $\varphi=\dfrac\pi4$。

易混：高斯公式要求闭曲面取**外**侧；若取内侧需加负号。另外 $\varphi$ 是与 $z$ 轴正向的夹角，锥面 $z=\sqrt{x^2+y^2}$ 的半顶角是 $\frac\pi4$，立体在锥**内**（即 $\varphi\leqslant\frac\pi4$）。

@易错
1. 不算散度就断言 $f$ 的项无法处理——恰恰是它们相消才使题目可做。
2. $\frac{\partial Q}{\partial y}$ 求导时漏掉内层 $\frac{x+4}{y+3}$ 对 $y$ 的导数中的负号，导致两项不相消。
3. 球坐标中 $\varphi$ 的范围取成 $[0,\frac\pi2]$（漏掉锥面限制）或体积元写成 $r\sin\varphi$。
4. $\int_1^2r^4dr$ 算成 $\frac{2^4-1}{4}$。

[8]
@题目
设
$$A = \begin{bmatrix} 1 & 0 & 0 & 0 \\ 1 & 2 & 0 & 0 \\ 2 & 4 & 3 & -3 \end{bmatrix} = (\alpha_{1},\alpha_{2},\alpha_{3},\alpha_{4}), \qquad B = \begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & 2 & 0 & 0 \\ 0 & 0 & 3 & 0 \end{bmatrix}$$
求：
（Ⅰ）向量组 $\alpha_{1},\alpha_{2},\alpha_{3},\alpha_{4}$ 的一个极大线性无关组；
（Ⅱ）可逆矩阵 $P_{3\times3}, Q_{4\times4}$，使得 $PAQ = B$.

@切入点
（Ⅰ）求极大线性无关组的标准动作是把 $A$ 作**初等行变换**化成阶梯形，主元所在列对应的向量即构成极大无关组。本题 $A$ 已经接近下三角，化简极快；注意 $\mathrm r(A)=3$，而 $\alpha_1,\alpha_2,\alpha_3$ 对应的三列恰好线性无关。

（Ⅱ）要找可逆的 $P,Q$ 使 $PAQ=B$，这就是**矩阵的等价标准形**思想：任何矩阵都可以通过有限次初等行变换（左乘）和初等列变换（右乘）化成"对角块"形式。所以做法是：

- 用**行变换**把 $A$ 化简，所有行变换的乘积就是 $P$（记录的方法：对 $A$ 做什么行变换，就对同阶单位矩阵做什么，最后得到的就是 $P$）；
- 再用**列变换**把剩下的非零元消掉，列变换的乘积就是 $Q$。

本题的目标 $B$ 已经给定为 $\mathrm{diag}$ 形状（$1,2,3$ 在对角上，第四列为零），所以行变换只需消去第一列、第二列的多余元素，列变换只需把 $(3,4)$ 位置的 $-3$ 消掉（用第 $3$ 列加到第 $4$ 列）。

关键提醒：**左乘对应行变换、右乘对应列变换**，且 $P$ 是 $3\times3$（行数）、$Q$ 是 $4\times4$（列数），这从尺寸上也能自检。

@解答
（Ⅰ）对 $A$ 作初等行变换：
$$A=\begin{pmatrix}1&0&0&0\\1&2&0&0\\2&4&3&-3\end{pmatrix}\xrightarrow{r_2-r_1}\begin{pmatrix}1&0&0&0\\0&2&0&0\\2&4&3&-3\end{pmatrix}\xrightarrow{r_3-2r_1-2r_2}\begin{pmatrix}1&0&0&0\\0&2&0&0\\0&0&3&-3\end{pmatrix}.$$
（其中第二步等价于先 $r_3-2r_1$ 再减去新 $r_2$ 的 $2$ 倍。）阶梯形中主元在第 $1,2,3$ 列，故 $\mathrm r(A)=3$，且
$$\alpha_1,\alpha_2,\alpha_3\ \text{是一个极大线性无关组}$$
（此时 $\alpha_4=-\alpha_3$）。

（Ⅱ）上述行变换对应的矩阵（对 $E_3$ 施以同样的行变换）为
$$P=\begin{pmatrix}1&0&0\\-1&1&0\\0&-2&1\end{pmatrix},  PA=\begin{pmatrix}1&0&0&0\\0&2&0&0\\0&0&3&-3\end{pmatrix}.$$
再作列变换 $c_4+c_3$（把第 $3$ 列加到第 $4$ 列）消去 $-3$，对应的矩阵为
$$Q=\begin{pmatrix}1&0&0&0\\0&1&0&0\\0&0&1&1\\0&0&0&1\end{pmatrix},$$
于是
$$PAQ=\begin{pmatrix}1&0&0&0\\0&2&0&0\\0&0&3&0\end{pmatrix}=B .$$
$P,Q$ 均为初等矩阵之积，故可逆。

@考点
用初等行变换求极大线性无关组（主元列）；矩阵的等价标准形 $PAQ$；初等变换与初等矩阵的对应（左行右列）；记录变换矩阵的方法（对单位矩阵施以同样的变换）。

易混：求极大线性无关组只能用**行**变换（行变换不改变列向量间的线性关系）；若用了列变换，列与原向量的对应就被打乱了。

@易错
1. 用列变换求极大无关组。
2. $P$、$Q$ 的尺寸弄反（$P$ 是 $3$ 阶、$Q$ 是 $4$ 阶）。
3. 记录 $P$ 时把行变换的顺序或符号搞错——最稳妥的自检是直接验算 $PA$。
4. 忘记说明 $P,Q$ 可逆。

[9]
@题目
设 $f(x)$ 在 $(-\infty,+\infty)$ 内是连续的奇函数，$\displaystyle F(x)=\int_{0}^{|x|}f(t)\,\mathrm{d}t$，则下列选项中正确的是（　）.
A. $F(x)$ 是不可导的奇函数
B. $F(x)$ 是可导的偶函数
C. ______（待核对）
D. $F(x)$ 是可导的奇函数

@切入点
$F(x)=\displaystyle\int_0^{|x|}f(t)dt$ 里那个绝对值是全部difficulty所在：它让人担心 $F$ 在 $x=0$ 处会出现"尖点"而不可导。破解的办法不是去分段求导，而是先弄清**被积函数的奇偶性带来的结构**。

记 $G(u)=\displaystyle\int_0^uf(t)dt$。这里有一条应当背下来的结论：
$$f\ \text{为奇函数}\Longrightarrow G\ \text{为偶函数};  f\ \text{为偶函数}\Longrightarrow G\ \text{为奇函数} .$$
（即"变限积分把奇偶性反转"。）本题 $f$ 是奇函数，所以 $G$ 是偶函数，于是
$$F(x)=G(|x|)=G(x) ,$$
绝对值**自动脱掉**！这一步一出，$F$ 就是普通的变限积分 $\int_0^xf(t)dt$，由 $f$ 连续知它处处可导且 $F'=f$，同时它是偶函数。

所以关键不在于讨论 $x>0$、$x<0$ 分段，而在于识破"偶函数复合绝对值等于它自己"。

@解答
记 $G(u)=\displaystyle\int_{0}^{u}f(t)dt$。因 $f$ 连续且为奇函数，
$$G(-u)=\int_{0}^{-u}f(t)dt\ \xrightarrow{t=-s}\ =\int_{0}^{u}f(-s)(-ds)=\int_{0}^{u}f(s)ds=G(u),$$
即 $G$ 为偶函数。于是
$$F(x)=G(|x|)=G(x)=\int_{0}^{x}f(t)dt .$$
由 $f$ 在 $(-\infty,+\infty)$ 上连续知 $F$ 处处可导，且 $F'(x)=f(x)$；又 $F=G$ 为偶函数。

故 $F(x)$ 是可导的偶函数，选 **B**。

（注：摘录中选项 C 缺失，但 A、D 已被上述结论否定，B 正确。）

@考点
变限积分的奇偶性反转规律；变限积分的可导性（被积函数连续则变限积分可导，且导数为被积函数）；偶函数与绝对值的关系 $G(|x|)=G(x)$。

易混：$f$ 奇 $\Rightarrow\int_0^xf$ 偶，这个结论**依赖下限取 $0$**；若下限换成别的常数 $a$，结论一般不成立（会差一个常数）。

@易错
1. 见到 $|x|$ 就断定 $x=0$ 处不可导（$|x|$ 本身不可导，但 $G(|x|)$ 未必）。
2. 分段求导时算 $x<0$ 的情形出错：$F'(x)=f(|x|)\cdot\mathrm{sgn}(x)=f(-x)\cdot(-1)=f(x)$，仍然等于 $f(x)$，可作为交叉验证。
3. 把奇偶性反转的方向记反。

[10]
@题目
设
$$\lim_{x\to 0}\frac{1}{\sin x-ax}\int_{b}^{x}\frac{t^{2}}{\sqrt{1+t^{2}}}\,\mathrm{d}t=c$$
且 $c\neq 0$，则（　）.
A. $a=1,\ b=0,\ c=-2$
B. $a=1,\ b=-2,\ c=-2$
C. $a=0,\ b=1,\ c=-2$
D. $a=1,\ b=1,\ c=1$

@切入点
这是"由极限值反推参数"的题，三个未知量 $a,b,c$ 看似要联立，实际上有严格的**先后顺序**，一个一个逼出来：

第一刀切 $b$。当 $x\to0$ 时分母 $\sin x-ax\to0$。若分子的极限**不为零**，整个式子就趋于 $\infty$，不可能等于有限数 $c$。而分子 $\displaystyle\int_b^x\frac{t^{2}}{\sqrt{1+t^{2}}}dt\to\int_b^0\frac{t^{2}}{\sqrt{1+t^{2}}}dt$，被积函数在 $t\neq0$ 时恒正，所以这个积分为零当且仅当 $b=0$。于是 $b=0$。

第二刀切 $a$。$b=0$ 后分子 $\displaystyle\int_0^x\frac{t^{2}}{\sqrt{1+t^{2}}}dt\sim\int_0^xt^{2}dt=\frac{x^{3}}{3}$，是**三阶**无穷小。分母 $\sin x-ax$：若 $a\neq1$，它 $\sim(1-a)x$ 是一阶的，比分子低阶，极限为 $0$，与 $c\neq0$ 矛盾。故 $a=1$，此时 $\sin x-x\sim-\frac{x^{3}}{6}$，也是三阶，阶数匹配。

第三步算 $c$：两个三阶主部一比即得。

整道题的逻辑主线是"**比较分子分母的阶**"，$c\neq0$ 这个条件正是用来强制两者同阶的。

@解答
设 $g(t)=\dfrac{t^{2}}{\sqrt{1+t^{2}}}$，它连续且当 $t\neq0$ 时 $g(t)>0$。

（1）定 $b$。分母 $\sin x-ax\to0$。若极限为有限的 $c$，则分子必趋于 $0$：
$$\int_{b}^{0}g(t)dt=0 .$$
因 $g$ 在 $t\neq0$ 处为正，必有 $b=0$。

（2）定 $a$。此时分子
$$\int_{0}^{x}\frac{t^{2}}{\sqrt{1+t^{2}}}dt\sim\int_{0}^{x}t^{2}dt=\frac{x^{3}}{3} (x\to0) .$$
若 $a\neq1$，分母 $\sin x-ax=(1-a)x+o(x)\sim(1-a)x$，则
$$\lim_{x\to0}\frac{x^{3}/3}{(1-a)x}=0=c ,$$
与 $c\neq0$ 矛盾。故 $a=1$。

（3）算 $c$。$a=1$ 时 $\sin x-x=-\dfrac{x^{3}}{6}+o(x^{3})$，故
$$c=\lim_{x\to0}\frac{\frac{x^{3}}{3}}{-\frac{x^{3}}{6}}=-2 .$$

即 $a=1$，$b=0$，$c=-2$，选 **A**。

@考点
变限积分的等价无穷小（$\int_0^x g(t)dt\sim\int_0^x g_{\text{主部}}$）；$\sin x-x\sim-\frac{x^{3}}{6}$；由极限存在（且非零）反推分子分母同阶；"分母趋于零且极限有限 $\Rightarrow$ 分子趋于零"这一常用推理。

易混：判断 $\int_0^x\frac{t^2}{\sqrt{1+t^2}}dt$ 的阶时，是把**被积函数**换成等价无穷小 $t^{2}$ 再积分，而不是对整个积分乱用等价替换。

@易错
1. 不先定 $b$，直接用洛必达，得到含 $b$ 的表达式后无从判断。
2. 忘记 $a=1$ 时 $\sin x-x$ 是三阶无穷小，仍按 $\sin x\sim x$ 替换得到 $0$。
3. 把 $\sin x-x$ 的系数记成 $+\frac16$，导致 $c=2$。
4. 只验证选项 A 成立，不排除其他（选择题可接受，但解答题必须完整推导）。

[11]
@题目
设
$$A = \begin{bmatrix} 1 & 1 & 1 \\ 0 & 1 & 1 \\ 0 & 0 & -1 \end{bmatrix}$$
则 $A^{18} = \underline{\hspace{2cm}}$.

@切入点
求 $A^{18}$，绝不能硬乘十八次。三条通用路线：

1. **相似对角化**：$A=P\Lambda P^{-1}$，则 $A^{k}=P\Lambda^{k}P^{-1}$。本题 $A$ 上三角，特征值是对角元 $1,1,-1$；$\lambda=1$ 是二重根，需检查是否有两个线性无关特征向量——算一下 $\mathrm r(A-E)=\mathrm r\begin{pmatrix}0&1&1\\0&0&1\\0&0&-2\end{pmatrix}=2$，几何重数只有 $1$，**不可对角化**。这条路走不通。
2. **拆成 $E+N$（$N$ 幂零）**：用二项式定理，因为 $N^{k}=O$ 后只剩有限项。
3. **先算低次幂找规律再归纳**。

本题最省事的是先算 $A^{2}$：
$$A^{2}=\begin{pmatrix}1&2&1\\0&1&0\\0&0&1\end{pmatrix}=E+N,  N=\begin{pmatrix}0&2&1\\0&0&0\\0&0&0\end{pmatrix},\ N^{2}=O .$$
$A^{2}$ 竟然是"单位阵加幂零"的形式，于是 $(A^{2})^{k}=E+kN$ 一步到位。而 $18=2\times9$ 是偶数，正好用上。

"先平方看看"在处理含 $-1$ 特征值（平方后变成 $1$）的矩阵时特别有效，这是本题的巧劲。

@解答
先计算
$$A^{2}=\begin{pmatrix}1&1&1\\0&1&1\\0&0&-1\end{pmatrix}^{2}=\begin{pmatrix}1&2&1\\0&1&0\\0&0&1\end{pmatrix} .$$
记 $A^{2}=E+N$，其中
$$N=\begin{pmatrix}0&2&1\\0&0&0\\0&0&0\end{pmatrix},  N^{2}=O .$$
由二项式定理（$E$ 与 $N$ 可交换）
$$(A^{2})^{k}=(E+N)^{k}=E+kN=\begin{pmatrix}1&2k&k\\0&1&0\\0&0&1\end{pmatrix} .$$
取 $k=9$：
$$A^{18}=(A^{2})^{9}=\begin{pmatrix}1&18&9\\0&1&0\\0&0&1\end{pmatrix} .$$

@考点
矩阵高次幂的三种求法（对角化、$E+N$ 拆分、归纳找规律）；幂零矩阵与二项式定理；上三角矩阵的特征值为对角元；可对角化的判别（几何重数 $=$ 代数重数）。

易混：二项式定理 $(E+N)^{k}=\sum C_k^iN^{i}$ 要求 $E$ 与 $N$ **可交换**；一般两个矩阵 $A,B$ 不可交换时 $(A+B)^{k}$ 不能这样展开。

@易错
1. 直接套对角化，没检查 $\lambda=1$ 的几何重数就写出 $P$。
2. 计算 $A^{2}$ 时出错（第一行应为 $[1,2,1]$）。
3. 忘记 $18=2\times9$，去算 $A^{18}=(A^{2})^{18}$。
4. 归纳时把 $A^{2k}$ 的 $(1,3)$ 元写成 $2k$ 或 $k^2$。

[12]
@题目
设 $f_{n}(x)=x^{n}-\cos x$（$n=1,2,\cdots$）.
（Ⅰ）证明方程 $f_{n}(x)=0$ 在 $x\in(0,1)$ 内有唯一实根 $x_{n}$；
（Ⅱ）求 $\displaystyle\lim_{n\to\infty}x_{n}^{\frac{1}{n}\ln\cos x_{n}}$.

@切入点
（Ⅰ）"方程在区间内有唯一根"的证明是固定的两段式：**存在性用零点定理**（端点函数值异号），**唯一性用单调性**（导数保号）。$f_n(0)=-1<0$，$f_n(1)=1-\cos1>0$，导数 $f_n'(x)=nx^{n-1}+\sin x$ 在 $(0,1)$ 内恒正，两段都很直接。

（Ⅱ）这一问的难点在于表达式 $x_n^{\frac1n\ln\cos x_n}$ 里同时出现 $x_n$ 和 $\cos x_n$，看似无从下手。突破口是**利用根所满足的方程**：$x_n$ 是根意味着
$$x_n^{n}=\cos x_n .$$
两边取对数得 $n\ln x_n=\ln\cos x_n$，也就是
$$\frac1n\ln\cos x_n=\ln x_n .$$
指数被**整体替换**成了 $\ln x_n$，于是
$$x_n^{\frac1n\ln\cos x_n}=x_n^{\ln x_n}=\mathrm e^{(\ln x_n)^{2}} .$$
问题只剩求 $\lim x_n$。

判断 $x_n\to1$ 用反证：若 $x_n$ 不趋于 $1$，则有子列 $x_{n_k}\leqslant L<1$，此时 $x_{n_k}^{n_k}\to0$，而 $\cos x_{n_k}\geqslant\cos1>0$，与 $x_n^{n}=\cos x_n$ 矛盾。故 $x_n\to1$，$\ln x_n\to0$，极限为 $\mathrm e^{0}=1$。

"用根满足的方程把复杂表达式化简"是这类数列极限题的核心套路。

@解答
（Ⅰ）$f_n(x)=x^{n}-\cos x$ 在 $[0,1]$ 上连续，且
$$f_n(0)=0-1=-1<0,  f_n(1)=1-\cos1>0 ,$$
由零点定理，存在 $x_n\in(0,1)$ 使 $f_n(x_n)=0$。又当 $0<x<1$ 时
$$f_n'(x)=nx^{n-1}+\sin x>0 ,$$
故 $f_n$ 在 $(0,1)$ 内严格单调增，根唯一。

（Ⅱ）由 $f_n(x_n)=0$ 得 $x_n^{n}=\cos x_n$。两边取对数（$0<x_n<1$，$\cos x_n>0$）：
$$n\ln x_n=\ln\cos x_n\Longrightarrow \frac1n\ln\cos x_n=\ln x_n .$$
故
$$x_n^{\frac1n\ln\cos x_n}=x_n^{\ln x_n}=\mathrm e^{(\ln x_n)^{2}} .$$

再证 $x_n\to1$：若不然，存在子列与常数 $L<1$ 使 $x_{n_k}\leqslant L$，于是
$$x_{n_k}^{n_k}\leqslant L^{n_k}\to0 ,$$
但 $x_{n_k}^{n_k}=\cos x_{n_k}\geqslant\cos1>0$，矛盾。又 $x_n<1$，故 $x_n\to1$。

于是 $\ln x_n\to0$，
$$\lim_{n\to\infty}x_n^{\frac1n\ln\cos x_n}=\mathrm e^{0}=1 .$$

@考点
零点定理与单调性证明方程根的存在唯一性；利用根满足的方程化简表达式；数列极限的反证法；$a^{b}=\mathrm e^{b\ln a}$。

易混：证明 $x_n\to1$ 不能只说"直观上根越来越靠近 $1$"，必须用反证或夹逼给出严格论证。

@易错
1. （Ⅱ）中不使用 $x_n^{n}=\cos x_n$，试图分别求 $\lim x_n$ 与 $\lim\frac1n\ln\cos x_n$ 再相乘——后者的处理绕不开同一个关系式。
2. 直接认定 $x_n\to1$ 而不证明。
3. 化简时把 $x_n^{\ln x_n}$ 写成 $\mathrm e^{\ln x_n}=x_n$。
4. （Ⅰ）中只证存在性，漏掉唯一性。

[13]
@题目
设 $z=(1+xy)^{y}$，则 $\mathrm{d}z\big|_{(1,1)}=$________.

@切入点
$z=(1+xy)^{y}$ 是**幂指函数**（底和指数都含变量），直接求偏导会很乱。标准处理有两种：

1. **对数求导法**：两边取对数得 $\ln z=y\ln(1+xy)$，再分别对 $x,y$ 求偏导，最后乘回 $z$。
2. 写成 $z=\mathrm e^{y\ln(1+xy)}$ 再求导，本质相同。

用哪种都行，对数求导法书写最短。注意对 $x$ 求导时 $y$ 视为常数（指数不变），对 $y$ 求导时**底和指数都在变**，必须用乘积法则，这是最容易漏项的地方。

最后代入 $(1,1)$：$z(1,1)=2^{1}=2$，别忘了乘这个因子。

全微分 $dz=z_x dx+z_y dy$，把两个偏导值填进去即可。

@解答
两边取对数：$\ln z=y\ln(1+xy)$。

对 $x$ 求偏导（$y$ 视为常数）：
$$\frac1z\frac{\partial z}{\partial x}=y\cdot\frac{y}{1+xy}=\frac{y^{2}}{1+xy}\Longrightarrow \frac{\partial z}{\partial x}=z\cdot\frac{y^{2}}{1+xy} .$$

对 $y$ 求偏导（$x$ 视为常数，用乘积法则）：
$$\frac1z\frac{\partial z}{\partial y}=\ln(1+xy)+y\cdot\frac{x}{1+xy}\Longrightarrow \frac{\partial z}{\partial y}=z[\ln(1+xy)+\frac{xy}{1+xy}] .$$

在 $(1,1)$ 处 $z=(1+1)^{1}=2$，$1+xy=2$，故
$$\frac{\partial z}{\partial x}|_{(1,1)}=2\cdot\frac12=1, 
\frac{\partial z}{\partial y}|_{(1,1)}=2(\ln2+\frac12)=2\ln2+1 .$$
所以
$$dz|_{(1,1)}=dx+(2\ln2+1)dy .$$

@考点
幂指函数的偏导数（对数求导法或化为 $\mathrm e^{u\ln v}$）；全微分公式 $dz=z_x dx+z_y dy$。

易混：对 $y$ 求导时 $(1+xy)^{y}$ 既有"指数变化"贡献 $\ln(1+xy)$，又有"底变化"贡献 $\frac{xy}{1+xy}$，两项缺一不可；只把它当成 $a^{y}$ 或只当成 $u^{c}$ 都会漏项。

@易错
1. 对 $y$ 求导只写 $z\ln(1+xy)$（把底当常数）。
2. 求完对数的导数后忘记乘回 $z$。
3. 代入点时 $z$ 的值算错。
4. 把 $dz$ 写成偏导之和而漏掉 $dx,dy$。

[14]
@题目
设三个不同平面的方程为 $a_{i1}x + a_{i2}y + a_{i3}z = b_{i}\ (i=1,2,3)$ 相交于一条直线，三个平面方程组成方程组的系数矩阵和增广矩阵分别记为 $A$ 和 $\overline{A}$，则（　　）.
A. $\mathrm{r}(A)=2,\ \mathrm{r}(\overline{A})=2$　B. $\mathrm{r}(A)=2,\ \mathrm{r}(\overline{A})=3$　C. $\mathrm{r}(A)=1,\ \mathrm{r}(\overline{A})=2$　D. $\mathrm{r}(A)=1,\ \mathrm{r}(\overline{A})=1$

@切入点
这道题要在"几何语言"和"代数语言"之间翻译。三个平面的方程组成方程组 $AX=b$，则：

- 方程组的**解集** $=$ 三个平面的公共部分；
- 题设公共部分是一条**直线**，即解集非空且是一维的。

于是两条代数结论立刻得到：
1. 有解 $\Rightarrow\mathrm r(A)=\mathrm r(\overline A)$；
2. 解集维数 $=n-\mathrm r(A)=3-\mathrm r(A)=1\Rightarrow\mathrm r(A)=2$。

所以 $\mathrm r(A)=\mathrm r(\overline A)=2$，选 A。

顺便理解其他选项对应的几何情形，有助于记牢这套对应：
- $\mathrm r(A)=2,\mathrm r(\overline A)=3$：无解，三平面两两相交但无公共点（三棱柱状）；
- $\mathrm r(A)=\mathrm r(\overline A)=1$：三个平面重合（但题设三平面互不相同，排除）；
- $\mathrm r(A)=1,\mathrm r(\overline A)=2$：三个平面互相平行（或部分重合），无公共点。

@解答
把三个平面方程写成线性方程组 $AX=b$，其中 $X=(x,y,z)^{\mathrm T}$，未知数个数 $n=3$。

三平面相交于一条直线，说明方程组**有解**，且解集是一条直线（一维）。由

（1）有解 $\Longleftrightarrow\mathrm r(A)=\mathrm r(\overline A)$；

（2）解集维数 $=n-\mathrm r(A)=3-\mathrm r(A)=1\Longrightarrow\mathrm r(A)=2$，

得 $\mathrm r(A)=\mathrm r(\overline A)=2$。故选 **A**。

@考点
线性方程组解的判定定理（有解 $\Leftrightarrow\mathrm r(A)=\mathrm r(\overline A)$；解集维数 $=n-\mathrm r(A)$）；线性方程组与平面位置关系的几何对应。

易混：$\mathrm r(A)=1$ 意味着三个平面的法向量都共线，即三平面互相平行或重合，公共部分要么是空集、要么是整个平面，不可能是一条直线。

@易错
1. 只用"有解"得出 $\mathrm r(A)=\mathrm r(\overline A)$ 而不定具体数值。
2. 把解集维数公式记成 $\mathrm r(A)$ 本身。
3. 忽略"三个平面互不相同"这一条（它排除了 D）。

[15]
@题目
设
$$\frac{1}{1 - x - x^2} = \sum_{n=0}^{\infty} a_n x^n.$$
证明：
（Ⅰ）$a_0 = 1,\ a_1 = 1,\ a_{n+2} = a_{n+1} + a_n\ (n = 0, 1, 2, \cdots)$；
（Ⅱ）$\sum\limits_{n=1}^{\infty} \dfrac{a_{n+1}}{a_n a_{n+2}}$ 收敛，并求其和.

@切入点
（Ⅰ）已知 $\dfrac{1}{1-x-x^{2}}=\sum a_nx^{n}$，要证系数的递推关系。思路是**把分母乘过去**，化成两个幂级数相等，再比较同次幂系数：
$$(1-x-x^{2})\sum_{n=0}^{\infty}a_nx^{n}=1 .$$
左端展开后 $x^{n+2}$ 的系数是 $a_{n+2}-a_{n+1}-a_n$，右端对应系数为 $0$，递推关系立得。常数项和一次项分别给出 $a_0=1$ 与 $a_1=1$。这个"乘分母比较系数"的手法是由生成函数求递推的通法（这里得到的正是斐波那契数列）。

（Ⅱ）级数
$$\sum\frac{a_{n+1}}{a_na_{n+2}}$$
的通项里有三个下标相邻的项，而递推关系给出 $a_{n+1}=a_{n+2}-a_n$。把分子这样一换：
$$\frac{a_{n+1}}{a_na_{n+2}}=\frac{a_{n+2}-a_n}{a_na_{n+2}}=\frac{1}{a_n}-\frac{1}{a_{n+2}} ,$$
通项变成**裂项**形式，部分和望远镜求和即可。注意这里是"隔两项"相消，所以留下的是**前两项和后两项**：
$$S_N=(\frac{1}{a_1}+\frac{1}{a_2})-(\frac{1}{a_{N+1}}+\frac{1}{a_{N+2}}) .$$
最后要说明 $a_n\to+\infty$（斐波那契数列严格递增趋于无穷），尾项才趋于 $0$。

@解答
（Ⅰ）由 $\dfrac{1}{1-x-x^{2}}=\displaystyle\sum_{n=0}^{\infty}a_nx^{n}$ 得
$$(1-x-x^{2})\sum_{n=0}^{\infty}a_nx^{n}=1 .$$
左端 $=\displaystyle\sum_{n=0}^{\infty}a_nx^{n}-\sum_{n=0}^{\infty}a_nx^{n+1}-\sum_{n=0}^{\infty}a_nx^{n+2}$。比较两端同次幂系数：

$x^{0}$：$a_0=1$；
$x^{1}$：$a_1-a_0=0$，故 $a_1=1$；
$x^{n+2}$（$n\geqslant0$）：$a_{n+2}-a_{n+1}-a_n=0$，即
$$a_{n+2}=a_{n+1}+a_n .$$

（Ⅱ）由递推得 $a_{n+1}=a_{n+2}-a_n$，故
$$\frac{a_{n+1}}{a_na_{n+2}}=\frac{a_{n+2}-a_n}{a_na_{n+2}}=\frac{1}{a_n}-\frac{1}{a_{n+2}} .$$
部分和
$$S_N=\sum_{n=1}^{N}(\frac{1}{a_n}-\frac{1}{a_{n+2}})=\frac{1}{a_1}+\frac{1}{a_2}-\frac{1}{a_{N+1}}-\frac{1}{a_{N+2}} .$$
由 $a_0=a_1=1$ 及递推知 $\{a_n\}$ 是正整数数列且从 $a_2=2$ 起严格递增，$a_n\to+\infty$，故 $\dfrac{1}{a_{N+1}},\dfrac{1}{a_{N+2}}\to0$。因此级数收敛，且
$$\sum_{n=1}^{\infty}\frac{a_{n+1}}{a_na_{n+2}}=\frac{1}{a_1}+\frac{1}{a_2}=1+\frac12=\frac32 .$$

@考点
幂级数的乘法与比较系数法（生成函数求递推）；裂项相消（望远镜）求级数和；由部分和的极限判定收敛性。

易混：裂项是"隔两项"的，相消后**首尾各留两项**；若按相邻裂项的习惯只留一项就会漏掉 $\frac{1}{a_2}$。

@易错
1. （Ⅰ）比较系数时下标平移出错，把 $x^{n+2}$ 的系数写成 $a_{n+2}-a_{n+1}-a_{n-1}$ 之类。
2. （Ⅱ）裂项方向弄反，得到 $\frac{1}{a_{n+2}}-\frac{1}{a_n}$。
3. 不说明 $a_n\to+\infty$ 就直接丢掉尾项。
4. 部分和写成 $\frac{1}{a_1}-\frac{1}{a_{N+2}}$。

[16]
@题目
设随机变量 $X$ 与 $Y$ 相关，相关系数为 $\rho_{XY}$，$Z=aX+b$（$a,b$ 为常数），则 $\rho_{YZ}=\rho_{XY}$ 的充分必要条件为（　　）.
A. $a>0$　B. $a<0$　C. $a\neq0$　D. $a=1$

@切入点
$Z=aX+b$ 是 $X$ 的**线性变换**，而相关系数对线性变换的响应是有固定规律的：
$$\rho_{Y,aX+b}=\mathrm{sgn}(a)\cdot\rho_{XY} (a\neq0) .$$
记住这条就能秒杀；不记得也可以现推，关键是两处：

- 分子 $\mathrm{Cov}(Y,aX+b)=a \mathrm{Cov}(X,Y)$（常数 $b$ 不影响协方差）——这里是 $a$；
- 分母 $\sqrt{DZ}=\sqrt{a^{2}DX}=|a|\sqrt{DX}$——这里是 $|a|$。

一个是 $a$、一个是 $|a|$，比值就是符号函数 $\mathrm{sgn}(a)$。

于是 $\rho_{YZ}=\rho_{XY}$ 当且仅当 $\mathrm{sgn}(a)\rho_{XY}=\rho_{XY}$。这里必须用上题设"$X$ 与 $Y$ **相关**"，即 $\rho_{XY}\neq0$，才能两边约掉得到 $\mathrm{sgn}(a)=1$，即 $a>0$。若 $\rho_{XY}=0$，则任何 $a\neq0$ 都行，答案就会变成 C——所以"相关"这个条件正是用来锁定 A 的。

@解答
因 $Z=aX+b$（需 $a\neq0$ 才有 $DZ>0$，相关系数才有意义），
$$\mathrm{Cov}(Y,Z)=\mathrm{Cov}(Y,aX+b)=a \mathrm{Cov}(X,Y),  \sqrt{DZ}=\sqrt{a^{2}DX}=|a|\sqrt{DX} .$$
故
$$\rho_{YZ}=\frac{\mathrm{Cov}(Y,Z)}{\sqrt{DY}\sqrt{DZ}}=\frac{a \mathrm{Cov}(X,Y)}{|a|\sqrt{DY}\sqrt{DX}}=\mathrm{sgn}(a)\cdot\rho_{XY} .$$

由题设 $X$ 与 $Y$ 相关，即 $\rho_{XY}\neq0$。于是
$$\rho_{YZ}=\rho_{XY}\Longleftrightarrow \mathrm{sgn}(a)=1\Longleftrightarrow a>0 .$$
选 **A**。

@考点
协方差与相关系数在线性变换下的变化规律；$\mathrm{Cov}(X,c)=0$、$D(aX+b)=a^{2}DX$；相关系数的定义式。

易混：协方差在线性变换下乘 $a$，标准差乘 $|a|$，所以相关系数只保留符号；这也说明相关系数是**无量纲**的、与单位和平移无关的量。

@易错
1. 分母写成 $a\sqrt{DX}$（漏绝对值），得出"任意 $a\neq0$ 均可"，选 C。
2. 忽略题设"相关"（$\rho_{XY}\neq0$），无法排除 C。
3. 认为必须 $a=1$（选 D），把"相关系数相等"误当成"变量相同"。

[17]
@题目
设 $D_t$ 是 $x^{\frac{2}{3}}+y^{\frac{2}{3}}=t^{\frac{2}{3}}\ (t>0)$ 所围区域，则
$$\lim_{t\to 0^{+}}\frac{1}{t^{2}}\iint_{D_t}(\sin x+\cos y)\mathrm{d}x\mathrm{d}y=（\quad）.$$
A. $\dfrac{\pi}{8}$　　B. $\dfrac{\pi}{4}$　　C. $\dfrac{3\pi}{8}$　　D. $\dfrac{\pi}{2}$

@切入点
这是一个"积分区域收缩到一点"的极限，结构是
$$\lim_{t\to0^{+}}\frac{1}{t^{2}}\iint_{D_t}g(x,y)dxdy .$$
处理这类问题的通用思想是：**当区域很小时，被积函数近似等于它在中心点的值**，于是积分 $\approx g(0,0)\cdot|D_t|$（$|D_t|$ 为面积）。所以只需两件事：

1. 算出 $g(0,0)$ 的有效贡献。这里 $g=\sin x+\cos y$，而 $\sin$ 那一项可以用**对称性直接消灭**：星形线 $x^{2/3}+y^{2/3}=t^{2/3}$ 关于 $y$ 轴对称，$\sin x$ 关于 $x$ 是奇函数，积分为 $0$。剩下 $\cos y$，在原点附近 $\cos y=1+O(y^{2})$，故 $\iint\cos y dxdy=|D_t|+O(t^{4})$。
2. 算出星形线围成的面积。$x^{2/3}+y^{2/3}=t^{2/3}$ 是**星形线（内摆线）**，面积公式 $S=\dfrac{3\pi t^{2}}{8}$ 应当记住（可用参数方程 $x=t\cos^{3}\theta,y=t\sin^{3}\theta$ 配合格林公式导出）。

两者一乘：极限 $=\dfrac{1}{t^{2}}\cdot\dfrac{3\pi t^{2}}{8}=\dfrac{3\pi}{8}$。

注意 $t^{2}$ 这个分母不是随便选的——它正好与面积同阶，这也提示我们答案应当是"面积系数"本身。

@解答
$D_t$ 是星形线 $x^{\frac23}+y^{\frac23}=t^{\frac23}$ 所围区域，其参数方程为 $x=t\cos^{3}\theta$，$y=t\sin^{3}\theta$，面积
$$|D_t|=\frac{3\pi t^{2}}{8} .$$

由于 $D_t$ 关于 $y$ 轴对称而 $\sin x$ 关于 $x$ 为奇函数，
$$\iint_{D_t}\sin x dxdy=0 .$$
又当 $(x,y)\in D_t$ 时 $|y|\leqslant t$，故 $\cos y=1+O(t^{2})$（一致地），于是
$$\iint_{D_t}\cos y dxdy=|D_t|+O(t^{2})|D_t|=\frac{3\pi t^{2}}{8}+O(t^{4}) .$$
因此
$$\lim_{t\to0^{+}}\frac{1}{t^{2}}\iint_{D_t}(\sin x+\cos y)dxdy=\lim_{t\to0^{+}}\frac{1}{t^{2}}[\frac{3\pi t^{2}}{8}+O(t^{4})]=\frac{3\pi}{8} .$$
选 **C**。

@考点
区域收缩时二重积分的主部估计（积分中值定理或泰勒展开）；利用对称性与奇偶性消项；星形线 $x^{2/3}+y^{2/3}=a^{2/3}$ 所围面积 $\frac{3\pi a^{2}}{8}$。

易混：也可以直接用二重积分中值定理：存在 $(\xi,\eta)\in D_t$ 使 $\iint_{D_t}g=g(\xi,\eta)|D_t|$，当 $t\to0^{+}$ 时 $(\xi,\eta)\to(0,0)$，$g(\xi,\eta)\to g(0,0)=0+1=1$，同样得到 $\frac{3\pi}{8}$——这条路更简短，但要求 $g$ 连续。

@易错
1. 不记得星形线面积公式，或错记成 $\pi t^{2}$、$\frac{3\pi t^2}{4}$。
2. 忘记用对称性消去 $\sin x$，试图硬算。
3. 用中值定理时忘了 $g(0,0)=\sin0+\cos0=1$，误算成 $0$。
4. 把区域当成圆盘 $x^{2}+y^{2}\leqslant t^{2}$。

[18]
@题目
设曲面 $S:z=\sqrt{R^2-x^2-y^2}\ (R>0)$，取下侧，计算
$$I=\iint_S \frac{Rx\,dydz+(R+z)^2dxdy}{\sqrt{x^2+y^2+z^2}}$$

@切入点
面对这个积分，先做一件几乎不费力却收益极大的事：注意 $S$ 是**球面的一部分**，在 $S$ 上
$$\sqrt{x^{2}+y^{2}+z^{2}}=R ,$$
是常数！于是分母直接变成 $R$ 提到积分号外，被积表达式大大简化：
$$I=\iint_S x dydz+\frac{(R+z)^{2}}{R}dxdy .$$
"在曲面上用曲面方程化简被积函数"是曲面积分的第一反射。

接下来 $S$ 不是闭曲面（是半球面），补面用高斯公式当然可以，但本题两项分别计算更直接：

- $\displaystyle\iint_Sx dydz$：可以投影到 $yOz$ 面（要分左右两片，麻烦），更快的是化成第一类积分 $\iint_S x\cos\alpha dS$，在球面上 $\cos\alpha=\pm\frac xR$，于是化为 $\frac1R\iint_Sx^{2}dS$，再用球面上的对称性 $\iint x^{2}dS=\iint y^{2}dS=\iint z^{2}dS=\frac13\iint(x^{2}+y^{2}+z^{2})dS$ 一步算出。
- $\displaystyle\iint_S\frac{(R+z)^{2}}{R}dxdy$：直接投影到 $xOy$ 面，下侧取负号，极坐标积分。

两处都要盯住**侧**：题目取下侧，第一项相对于"上侧"要变号，第二项投影时直接带负号。

@解答
在 $S$ 上 $x^{2}+y^{2}+z^{2}=R^{2}$，故分母为常数 $R$：
$$I=\iint_S x dydz+\frac{1}{R}\iint_S(R+z)^{2}dxdy .$$

（1）先在**上侧**计算 $\displaystyle\iint x dydz$。上半球面取上侧时单位法向量为 $\dfrac{(x,y,z)}{R}$，故 $\cos\alpha=\dfrac xR$，
$$\iint_{S(\text{上侧})}x dydz=\iint_S x\cdot\frac xR dS=\frac1R\iint_Sx^{2}dS .$$
由球面的对称性，$\displaystyle\iint_Sx^{2}dS=\frac13\iint_S(x^{2}+y^{2}+z^{2})dS=\frac13R^{2}\cdot2\pi R^{2}=\frac{2\pi R^{4}}{3}$，故
$$\iint_{S(\text{上侧})}x dydz=\frac{2\pi R^{3}}{3},  \iint_{S(\text{下侧})}x dydz=-\frac{2\pi R^{3}}{3} .$$

（2）$S$ 在 $xOy$ 面上的投影为 $D:x^{2}+y^{2}\leqslant R^{2}$，取下侧故加负号：
$$\frac1R\iint_S(R+z)^{2}dxdy=-\frac1R\iint_{D}(R+\sqrt{R^{2}-x^{2}-y^{2}})^{2}dxdy .$$
极坐标，令 $u=\sqrt{R^{2}-r^{2}}$（$r dr=-u du$）：
$$\int_{0}^{R}(R+\sqrt{R^{2}-r^{2}})^{2}r dr=\int_{0}^{R}(R+u)^{2}u du=\frac{R^{4}}{2}+\frac{2R^{4}}{3}+\frac{R^{4}}{4}=\frac{17R^{4}}{12} ,$$
故该项 $=-\dfrac{2\pi}{R}\cdot\dfrac{17R^{4}}{12}=-\dfrac{17\pi R^{3}}{6}$。

合计
$$I=-\frac{2\pi R^{3}}{3}-\frac{17\pi R^{3}}{6}=-\frac{7\pi R^{3}}{2} .$$

@考点
利用曲面方程化简被积函数；第二类曲面积分与第一类的转化 $\iint P dydz=\iint P\cos\alpha dS$；球面上的轮换对称性；投影法计算 $\iint R dxdy$ 时的定侧规则（上侧取正、下侧取负）。

易混：球面上 $\iint x^{2}dS=\iint y^{2}dS=\iint z^{2}dS$ 是**轮换对称性**，对整个球面和上半球面都成立（因为 $x^2,y^2,z^2$ 在上半球面上的对称性仍然成立）；但 $\iint x dS=0$ 这类一次项的对称性要另行判断。

@易错
1. 忘记 $S$ 上 $\sqrt{x^2+y^2+z^2}=R$，把分母留在积分里。
2. 侧的符号弄错——题目取**下侧**，两项都要相应处理。
3. 第二项换元后积分限没反号（$u$ 从 $R$ 到 $0$，与 $-u du$ 的负号相抵）。
4. 上半球面面积记成 $4\pi R^{2}$（应为 $2\pi R^{2}$）。

[19]
@题目
设自动机床在任何时长为 $t$ 的时间间隔内发生故障的次数 $X$ 服从参数为 $\lambda t$ 的泊松分布，$Y$ 表示相继两次故障之间的时间间隔，则当 $t>0$ 时，$P\{Y>t\}=$ ______.

@切入点
这道题考的是泊松过程与指数分布之间的经典联系，破题的关键是把"时间间隔"翻译成"计数"：

$$\{Y>t\}\ \text{（下一次故障要等 }t\text{ 以上）}\Longleftrightarrow\{[0,t]\ \text{内一次故障也没发生}\}=\{X=0\} .$$

也就是说，**"等待时间超过 $t$"与"这段时间内计数为零"是同一个事件**。一旦写出这个等价，剩下的只是代泊松分布的概率公式
$$P\{X=k\}=\frac{(\lambda t)^{k}}{k!}\mathrm e^{-\lambda t} ,$$
取 $k=0$ 即可。

顺带得到一个应当记住的结论：$P\{Y\leqslant t\}=1-\mathrm e^{-\lambda t}$，即 $Y$ 服从参数为 $\lambda$ 的**指数分布**——泊松流的时间间隔一定是指数分布。

@解答
事件"两次故障的时间间隔 $Y>t$"等价于"在长度为 $t$ 的时间段内没有发生故障"，即 $\{X=0\}$，其中 $X$ 服从参数为 $\lambda t$ 的泊松分布。故
$$P\{Y>t\}=P\{X=0\}=\frac{(\lambda t)^{0}}{0!}\mathrm e^{-\lambda t}=\mathrm e^{-\lambda t} (t>0) .$$

（由此 $F_Y(t)=1-\mathrm e^{-\lambda t}$（$t>0$），即 $Y$ 服从参数为 $\lambda$ 的指数分布。）

@考点
泊松分布的概率公式；泊松流中相邻事件的时间间隔服从指数分布；把"等待时间"事件转化为"计数"事件。

易混：泊松分布的参数是 $\lambda t$（与时间长度成正比），而对应的指数分布参数是 $\lambda$（与 $t$ 无关）；两者不要混用。

@易错
1. 直接去求 $Y$ 的密度而不通过 $X$。
2. 把 $P\{X=0\}$ 写成 $\mathrm e^{-\lambda}$（漏掉 $t$）。
3. 求出的是 $P\{Y\leqslant t\}$ 而题目问的是 $P\{Y>t\}$。

[20]
@题目
设 $f(x)$ 是定义在 $\mathbf{R}$ 上的偶函数，且 $f(x) + f'(x) = 2e^x$，若 $a[f'(x) - e^x] \leqslant x$ 在 $\mathbf{R}$ 上恒成立，则 $a$ 的取值范围为（　　）.
A. $(-\infty, 0]$　　B. $(-\infty, -\dfrac{1}{e}]$　　C. $(-\infty, -1)$　　D. $(-\infty, -e]$

@切入点
题目给的是一个**函数方程**（$f+f'=2\mathrm e^{x}$）加上**奇偶性**。奇偶性在这类题里的标准用法是：把 $x$ 换成 $-x$ 得到第二个方程，与原方程**联立**消元。

设 $f$ 为奇函数，则 $f(-x)=-f(x)$，$f'(-x)=f'(x)$（奇函数的导数是偶函数）。原式在 $-x$ 处为
$$f(-x)+f'(-x)=2\mathrm e^{-x}\Longrightarrow -f(x)+f'(x)=2\mathrm e^{-x} .$$
与原式相加即得 $f'(x)=\mathrm e^{x}+\mathrm e^{-x}$，相减得 $f(x)=\mathrm e^{x}-\mathrm e^{-x}$。注意这里**根本不用解微分方程**，联立就够了——这是本题最省力的地方。

于是 $f'(x)-\mathrm e^{x}=\mathrm e^{-x}>0$，不等式 $a\mathrm e^{-x}\leqslant x$ 对一切 $x$ 成立。因 $\mathrm e^{-x}>0$，可两边同除：
$$a\leqslant x\mathrm e^{x} (\forall x)\Longleftrightarrow a\leqslant\min_{x\in\mathbb R}x\mathrm e^{x} .$$
最后求 $\min x\mathrm e^{x}$：求导 $(1+x)\mathrm e^{x}=0$ 给出 $x=-1$，最小值 $-\dfrac1{\mathrm e}$。

**题干存疑**：若按题面的"偶函数"处理，联立得 $f=\mathrm e^{x}+\mathrm e^{-x}$，$f'-\mathrm e^{x}=-\mathrm e^{-x}$，条件化为 $a\geqslant\frac1{\mathrm e}$，与四个选项（都是上界）全不相符。故"偶"应为"奇"，请对照原书核对。

@解答
设 $f$ 为奇函数（见下方说明），则 $f(-x)=-f(x)$，$f'(-x)=f'(x)$。在 $f(x)+f'(x)=2\mathrm e^{x}$ 中以 $-x$ 代 $x$：
$$-f(x)+f'(x)=2\mathrm e^{-x} .$$
与原式相加、相减分别得
$$f'(x)=\mathrm e^{x}+\mathrm e^{-x},  f(x)=\mathrm e^{x}-\mathrm e^{-x} .$$
于是 $f'(x)-\mathrm e^{x}=\mathrm e^{-x}$，所给条件成为
$$a\mathrm e^{-x}\leqslant x (\forall x\in\mathbb R) .$$
因 $\mathrm e^{-x}>0$，等价于
$$a\leqslant x\mathrm e^{x} (\forall x\in\mathbb R)\Longleftrightarrow a\leqslant\min_{x\in\mathbb R}x\mathrm e^{x} .$$
令 $g(x)=x\mathrm e^{x}$，$g'(x)=(1+x)\mathrm e^{x}$，故 $g$ 在 $(-\infty,-1)$ 上递减、在 $(-1,+\infty)$ 上递增，
$$\min g=g(-1)=-\frac1{\mathrm e} .$$
故 $a\leqslant-\dfrac1{\mathrm e}$，即 $a\in(-\infty,-\dfrac1{\mathrm e}]$，选 **B**。

**说明（题干需核对）**：若按题面"偶函数"，则联立得 $f(x)=\mathrm e^{x}+\mathrm e^{-x}$，$f'(x)-\mathrm e^{x}=-\mathrm e^{-x}$，条件化为 $a\geqslant\dfrac1{\mathrm e}$，与四个选项均不符。故"偶函数"疑应为"奇函数"，请对照原书。

@考点
利用奇偶性把函数方程在 $x$ 与 $-x$ 处联立求解；奇函数的导数为偶函数（反之亦然）；"不等式对一切 $x$ 成立"化为求最值；$x\mathrm e^{x}$ 的最小值 $-\frac1{\mathrm e}$。

易混：$f$ 奇 $\Rightarrow f'$ 偶；$f$ 偶 $\Rightarrow f'$ 奇。这一步弄反，联立出来的结果完全不同。

@易错
1. 去解微分方程 $y'+y=2\mathrm e^{x}$ 得到 $f=\mathrm e^{x}+C\mathrm e^{-x}$，再用奇偶性定 $C$——可行但绕，且容易在 $C$ 的确定上出错。
2. 不等式两边除以 $\mathrm e^{-x}$ 时误以为要讨论符号（$\mathrm e^{-x}$ 恒正，不必讨论）。
3. 把"对一切 $x$ 成立"化成"对某个 $x$ 成立"，求成最大值。
4. $x\mathrm e^{x}$ 的最小值点记成 $x=1$。

[21]
@题目
设 $\alpha_{1},\alpha_{2},\alpha_{3}$ 为线性无关的 3 维列向量，$A = (\alpha_{1},\alpha_{2},\alpha_{3})$，交换 $A$ 的第 2 列与第 3 列，再将第 2 列乘以 $(-4)$，第 3 列乘以 $(-1)$ 得 $C$，若 $BA = C$，则 $\mathrm{tr}(B) = \underline{\hspace{2cm}}$.

@切入点
题目给的是对 $A$ 做**列变换**得到 $C$，而条件是 $BA=C$——注意 $B$ 是**左**乘。左乘对应行变换，右乘对应列变换，两者不能直接对应，所以要绕一下：

先把列变换写成右乘：
$$C=(\alpha_1,\ -4\alpha_3,\ -\alpha_2)=AQ,  Q=\begin{pmatrix}1&0&0\\0&0&-1\\0&-4&0\end{pmatrix} .$$
（$Q$ 的第 $j$ 列给出 $C$ 的第 $j$ 列用 $\alpha_1,\alpha_2,\alpha_3$ 的表示系数，这是写 $Q$ 最不容易错的方法。）

再由 $BA=AQ$，且 $\alpha_1,\alpha_2,\alpha_3$ 线性无关使 $A$ 可逆，得
$$B=AQA^{-1} .$$
于是 $B$ 与 $Q$ **相似**。而相似矩阵的迹相等，所以
$$\mathrm{tr}(B)=\mathrm{tr}(Q)=1+0+0=1 .$$
整道题的关键就在于识破"$B$ 相似于 $Q$"——不需要求出 $A$，也不需要求出 $B$。

@解答
交换 $A$ 的第 $2,3$ 列得 $(\alpha_1,\alpha_3,\alpha_2)$，再将第 $2$ 列乘 $-4$、第 $3$ 列乘 $-1$，得
$$C=(\alpha_1,\ -4\alpha_3,\ -\alpha_2) .$$
把 $C$ 的每一列用 $\alpha_1,\alpha_2,\alpha_3$ 表示，得 $C=AQ$，其中
$$Q=\begin{pmatrix}1&0&0\\0&0&-1\\0&-4&0\end{pmatrix} .$$
因 $\alpha_1,\alpha_2,\alpha_3$ 线性无关，$A$ 可逆。由 $BA=C=AQ$ 得
$$B=AQA^{-1},$$
即 $B$ 与 $Q$ 相似。相似矩阵有相同的迹，故
$$\mathrm{tr}(B)=\mathrm{tr}(Q)=1 .$$

@考点
初等列变换与右乘初等矩阵的对应；相似矩阵的定义与不变量（迹、行列式、特征值、秩）；$A$ 可逆的判据（列向量组线性无关）。

易混：左乘 $\Leftrightarrow$ 行变换，右乘 $\Leftrightarrow$ 列变换；本题的变换是列变换，却给出 $BA=C$ 的左乘形式，正是要考这个转换。

@易错
1. 把 $Q$ 写成它的转置（列表示与行表示弄反）。
2. 直接说 $B=Q$（忽略了相似变换）。
3. 忘记相似矩阵迹相等这条性质，试图具体求 $B$。
4. $Q$ 中 $-4$ 与 $-1$ 的位置放反：第 $2$ 列是 $-4\alpha_3$，故 $Q$ 的 $(3,2)$ 元为 $-4$。

[22]
@题目
设 $z=f(x,y)$ 在点 $(0,0)$ 的某邻域内有定义，且 $f'_x(0,0)=1$，$f'_y(0,0)=1$，则（　）.
A. $\mathrm{d}z\big|_{(0,0)}=\mathrm{d}x+\mathrm{d}y$
B. 曲线 $\begin{cases}z=f(x,y),\\ y=0\end{cases}$ 在点 $(0,0,f(0,0))$ 处的切向量为 $(1,0,1)$
C. 曲面 $z=f(x,y)$ 在点 $(0,0,f(0,0))$ 处的法向量为 $(1,1,1)$
D. $\lim\limits_{\substack{x\to 0\\ y\to 0}}f(x,y)$ 必存在

@切入点
题设只给了**两个偏导数存在**，这是二元函数里非常弱的条件——它只说明函数沿两条坐标轴方向的变化率存在，对函数在其他方向乃至整体的行为几乎没有约束。所以做这道题的第一件事是把"偏导数存在"能推出什么、不能推出什么理清楚：

偏导数存在 $\not\Rightarrow$ 可微，$\not\Rightarrow$ 连续，$\not\Rightarrow$ 二重极限存在。

对照选项：
- A 说的是全微分存在（即**可微**），不成立；
- C 说的是曲面有切平面（同样要**可微**），不成立；
- D 说二重极限必存在，不成立（例如 $f=\frac{xy}{x^{2}+y^{2}}$，两个偏导数在原点都存在，但二重极限不存在）；
- B 说的是曲线 $z=f(x,0)$ 的切向量。这条曲线在平面 $y=0$ 内，它的切向量只需要**一元函数 $f(x,0)$ 在 $x=0$ 可导**，而这恰恰就是 $f'_x(0,0)$ 存在的含义！所以 B 成立，切向量为 $(1,0,f'_x(0,0))=(1,0,1)$。

这道题的精髓是：偏导数的几何意义就是"曲面与坐标平面的交线的切线斜率"，它是**一元**的信息，因此只能支持 B 这种一元的结论。

@解答
A 错误。$dz|_{(0,0)}=dx+dy$ 要求 $f$ 在 $(0,0)$ 处**可微**，而仅有两个偏导数存在推不出可微。

C 错误。曲面在一点有法向量（切平面）同样要求 $f$ 在该点可微。

D 错误。偏导数存在只反映沿坐标轴方向的性质，推不出二重极限存在。例如
$$f(x,y)=\begin{cases}\dfrac{xy}{x^{2}+y^{2}},&(x,y)\neq(0,0),\\0,&(x,y)=(0,0),\end{cases}$$
两个偏导数在原点都存在（均为 $0$），但 $\lim\limits_{(x,y)\to(0,0)}f$ 不存在。

B 正确。曲线 $\begin{cases}z=f(x,y),\\ y=0\end{cases}$ 即 $z=f(x,0)$（在平面 $y=0$ 内），可参数化为 $(x,0,f(x,0))$。因 $f'_x(0,0)$ 存在，一元函数 $x\mapsto f(x,0)$ 在 $x=0$ 可导，切向量为
$$(1,\ 0,\ \frac{d}{dx}f(x,0)|_{x=0})=(1,0,f'_x(0,0))=(1,0,1) .$$

故选 **B**。

@考点
偏导数、可微、连续、极限存在之间的蕴含关系（二元函数中偏导数存在是最弱的条件）；偏导数的几何意义（曲面与坐标平面交线的切线斜率）；全微分与切平面都要求可微。

易混：一元函数中"可导 $\Rightarrow$ 连续"，二元函数中"偏导数存在"既推不出连续也推不出可微；只有"偏导数存在且连续"才能推出可微。

@易错
1. 把偏导数存在当成可微，选 A 或 C。
2. 认为 $f$ 在 $(0,0)$ 有定义且偏导存在就连续，选 D。
3. B 中切向量的第三个分量写成 $f'_y(0,0)$ 或 $f(0,0)$。

[23]
@题目
设 $f(u)$ 有二阶连续导数，$z = f(\sqrt{x^2 + y^2})$ 满足
$$\frac{\partial^2 z}{\partial x^2} + \frac{\partial^2 z}{\partial y^2} = x^2 + y^2,$$
求 $z$ 的表达式.

@切入点
$z=f(\sqrt{x^{2}+y^{2}})$ 是**径向对称**（只依赖到原点的距离 $r$）的函数，方程左端是拉普拉斯算子。对这类函数，有一条应当熟记的结论：
$$\frac{\partial^{2}z}{\partial x^{2}}+\frac{\partial^{2}z}{\partial y^{2}}=f''(r)+\frac{1}{r}f'(r) .$$
（可由链式法则直接算出：$z_x=f'\frac xr$，$z_{xx}=f''\frac{x^{2}}{r^{2}}+f'\frac{r^{2}-x^{2}}{r^{3}}$，对 $y$ 同理，相加即得。）

于是偏微分方程被化成**一元常微分方程**
$$f''(r)+\frac{f'(r)}{r}=r^{2} .$$

接下来不要按二阶变系数方程去硬解，注意左端乘以 $r$ 之后是一个恰当导数：
$$rf''+f'=(rf')' .$$
所以两边同乘 $r$ 得 $(rf')'=r^{3}$，一次积分降阶，再积分即得 $f$。这个"乘 $r$ 凑成 $(rf')'$"的技巧在平面径向问题里反复出现（三维的对应形式是乘 $r^{2}$）。

@解答
记 $r=\sqrt{x^{2}+y^{2}}$。由链式法则
$$\frac{\partial z}{\partial x}=f'(r)\cdot\frac xr,  \frac{\partial^{2}z}{\partial x^{2}}=f''(r)\frac{x^{2}}{r^{2}}+f'(r)\frac{r^{2}-x^{2}}{r^{3}} ,$$
对 $y$ 同理。相加得
$$\frac{\partial^{2}z}{\partial x^{2}}+\frac{\partial^{2}z}{\partial y^{2}}=f''(r)+\frac{f'(r)}{r} .$$
故原方程化为
$$f''(r)+\frac{f'(r)}{r}=r^{2} .$$
两边乘 $r$：
$$rf''(r)+f'(r)=r^{3},  \text{即}  (rf'(r))'=r^{3} .$$
积分得 $rf'(r)=\dfrac{r^{4}}{4}+C_1$，即 $f'(r)=\dfrac{r^{3}}{4}+\dfrac{C_1}{r}$，再积分
$$f(r)=\frac{r^{4}}{16}+C_1\ln r+C_2 .$$
故
$$z=\frac{(x^{2}+y^{2})^{2}}{16}+\frac{C_1}{2}\ln(x^{2}+y^{2})+C_2 ,$$
其中 $C_1,C_2$ 为任意常数。

@考点
径向函数的拉普拉斯算子 $\Delta z=f''(r)+\frac{f'(r)}{r}$；可降阶的二阶方程（恰当导数型 $rf''+f'=(rf')'$）；复合函数的二阶偏导。

易混：二维的径向拉普拉斯算子是 $f''+\frac{f'}{r}$，三维的是 $f''+\frac{2f'}{r}$（对应 $(r^{2}f')'/r^{2}$）；两者系数不同。

@易错
1. 求 $z_{xx}$ 时漏掉 $f'$ 那一项（$\frac xr$ 对 $x$ 求导的贡献）。
2. 得到 $f''+\frac{f'}{r}=r^{2}$ 后按常系数方程处理。
3. 积分时漏掉 $C_1\ln r$ 项，只给出一个特解。
4. 最后回代时把 $\ln r$ 写成 $\ln(x^{2}+y^{2})$ 而忘了系数 $\frac12$。

[24]
@题目
设总体 $X \sim U(0,\theta)\ (\theta > 0)$，$(X_1,X_2,\cdots,X_n)$ 为 $X$ 的简单随机样本，$X_{(n)} = \max\{X_1,X_2,\cdots,X_n\}$。
（Ⅰ）证明：
$$\hat{\theta}_1 = 2\overline{X}, \quad \hat{\theta}_2 = \frac{n+1}{n}X_{(n)}$$
是 $\theta$ 的无偏估计；
（Ⅱ）当 $n \geqslant 2$ 时，$\hat{\theta}_1$ 和 $\hat{\theta}_2$ 哪一个有效？

@切入点
（Ⅰ）验证无偏性就是算期望是否等于 $\theta$，用到两个现成结论：
$$E\overline X=EX=\frac\theta2,  EX_{(n)}=\frac{n}{n+1}\theta .$$
后者需要 $X_{(n)}$ 的密度 $\frac{nx^{n-1}}{\theta^{n}}$（最大值的分布函数是 $[F(x)]^{n}$，求导即得）。$\hat\theta_2$ 前面那个系数 $\frac{n+1}{n}$ 正是为了抵消这个偏差而设的。

（Ⅱ）"哪个更有效"就是比较**方差**，方差小者有效。两个方差分别为：
$$D\hat\theta_1=4D\overline X=\frac{4}{n}\cdot\frac{\theta^{2}}{12}=\frac{\theta^{2}}{3n}, 
D\hat\theta_2=(\frac{n+1}{n})^{2}DX_{(n)}=\frac{\theta^{2}}{n(n+2)} .$$
比较 $n(n+2)$ 与 $3n$：当 $n\geqslant2$ 时 $n+2>3$，故 $D\hat\theta_2<D\hat\theta_1$。

值得注意的是两者的**阶**不同：$D\hat\theta_1$ 是 $O(\frac1n)$，而 $D\hat\theta_2$ 是 $O(\frac{1}{n^{2}})$——基于极值统计量的估计收敛得快得多，这是均匀分布这类"支撑端点即参数"模型的特点。

@解答
（Ⅰ）$X\sim U(0,\theta)$，故 $EX=\dfrac\theta2$，$DX=\dfrac{\theta^{2}}{12}$。

对 $\hat\theta_1$：
$$E\hat\theta_1=2E\overline X=2EX=\theta ,$$
是无偏估计。

对 $\hat\theta_2$：$X_{(n)}$ 的分布函数为 $[F(x)]^{n}=\dfrac{x^{n}}{\theta^{n}}$（$0\leqslant x\leqslant\theta$），密度为 $\dfrac{nx^{n-1}}{\theta^{n}}$，故
$$EX_{(n)}=\int_{0}^{\theta}x\cdot\frac{nx^{n-1}}{\theta^{n}}dx=\frac{n}{n+1}\theta\Longrightarrow E\hat\theta_2=\frac{n+1}{n}\cdot\frac{n}{n+1}\theta=\theta ,$$
也是无偏估计。

（Ⅱ）
$$D\hat\theta_1=4D\overline X=\frac{4DX}{n}=\frac{4}{n}\cdot\frac{\theta^{2}}{12}=\frac{\theta^{2}}{3n} .$$
又
$$EX_{(n)}^{2}=\int_{0}^{\theta}x^{2}\cdot\frac{nx^{n-1}}{\theta^{n}}dx=\frac{n}{n+2}\theta^{2}, 
DX_{(n)}=\frac{n}{n+2}\theta^{2}-\frac{n^{2}}{(n+1)^{2}}\theta^{2}=\frac{n\theta^{2}}{(n+2)(n+1)^{2}} ,$$
故
$$D\hat\theta_2=(\frac{n+1}{n})^{2}\cdot\frac{n\theta^{2}}{(n+2)(n+1)^{2}}=\frac{\theta^{2}}{n(n+2)} .$$
当 $n\geqslant2$ 时 $n+2>3$，故 $n(n+2)>3n$，从而
$$D\hat\theta_2<D\hat\theta_1 ,$$
即 $\hat\theta_2=\dfrac{n+1}{n}X_{(n)}$ 更有效。

@考点
无偏估计的定义；均匀分布的数字特征；次序统计量最大值的分布 $F_{\max}=[F]^{n}$；有效性的比较（在无偏的前提下比方差）。

易混："有效"必须在**都无偏**的前提下比较方差；若一个有偏一个无偏，直接比方差没有意义（要比均方误差）。

@易错
1. 忘记 $DX=\frac{\theta^{2}}{12}$（均匀分布 $U(a,b)$ 的方差是 $\frac{(b-a)^{2}}{12}$）。
2. $D(2\overline X)$ 写成 $2D\overline X$（应乘 $4$）。
3. 计算 $DX_{(n)}$ 时通分出错。
4. 比较时忘了题设 $n\geqslant2$（$n=1$ 时两者相同）。

[25]
@题目
设正值数列 $\{a_n\}, \{b_n\}$ 满足 $b_1 = 1,\ b_{n+1}(b_{n+1} - b_n) = a_n\ (n = 1, 2, \cdots)$，则 $\{b_n\}$ 收敛是级数 $\sum\limits_{n=1}^{\infty} a_n$ 收敛的（　　）.
A. 充分非必要条件　　B. 必要非充分条件
C. 充分必要条件　　D. 既非充分也非必要条件

@切入点
这是"充分必要条件"判断题，要双向验证。手上的工具只有递推式
$$b_{n+1}(b_{n+1}-b_n)=a_n>0 ,$$
以及 $b_n>0$、$b_1=1$。

第一件事是从递推式中挖出**单调性**：因为 $b_{n+1}>0$ 且乘积为正，必有 $b_{n+1}-b_n>0$，即 $\{b_n\}$ 严格递增。于是 $b_n\geqslant b_1=1$，并且"$\{b_n\}$ 收敛"等价于"$\{b_n\}$ 有界"（单调有界准则）。这一步把问题彻底转化成了级数 $\sum(b_{n+1}-b_n)$ 与 $\sum a_n$ 的敛散比较——因为部分和
$$\sum_{n=1}^{N}(b_{n+1}-b_n)=b_{N+1}-b_1 ,$$
所以 $\sum(b_{n+1}-b_n)$ 收敛 $\Leftrightarrow\{b_n\}$ 收敛。

于是只需比较 $a_n$ 与 $b_{n+1}-b_n$ 的大小，而 $a_n=b_{n+1}\cdot(b_{n+1}-b_n)$，倍数就是 $b_{n+1}$：
- **下界**：$b_{n+1}\geqslant1$，故 $a_n\geqslant b_{n+1}-b_n$，于是 $\sum a_n$ 收敛 $\Rightarrow\sum(b_{n+1}-b_n)$ 收敛；
- **上界**：若 $b_n\to L$，则 $b_{n+1}\leqslant L$，故 $a_n\leqslant L(b_{n+1}-b_n)$，于是 $\{b_n\}$ 收敛 $\Rightarrow\sum a_n$ 收敛。

两个方向都通，是充要条件。

@解答
由 $b_{n+1}(b_{n+1}-b_n)=a_n>0$ 及 $b_{n+1}>0$ 知 $b_{n+1}>b_n$，故 $\{b_n\}$ 严格递增，且 $b_n\geqslant b_1=1$。又
$$\sum_{n=1}^{N}(b_{n+1}-b_n)=b_{N+1}-1 ,$$
故级数 $\sum(b_{n+1}-b_n)$ 收敛当且仅当 $\{b_n\}$ 收敛。

**充分性**（$\{b_n\}$ 收敛 $\Rightarrow\sum a_n$ 收敛）：设 $b_n\to L$，则对一切 $n$ 有 $b_{n+1}\leqslant L$，故
$$0<a_n=b_{n+1}(b_{n+1}-b_n)\leqslant L(b_{n+1}-b_n) ,$$
由比较判别法，$\sum a_n$ 收敛（且和不超过 $L(L-1)$）。

**必要性**（$\sum a_n$ 收敛 $\Rightarrow\{b_n\}$ 收敛）：由 $b_{n+1}\geqslant1$ 得
$$a_n=b_{n+1}(b_{n+1}-b_n)\geqslant b_{n+1}-b_n>0 ,$$
故 $\sum(b_{n+1}-b_n)$ 收敛，即 $\{b_n\}$ 收敛。

故"$\{b_n\}$ 收敛"是"$\sum a_n$ 收敛"的充分必要条件，选 **C**。

@考点
单调有界准则；数列收敛与"相邻差之级数"收敛的等价性；正项级数的比较判别法；充要条件的双向论证。

易混：$\sum(b_{n+1}-b_n)$ 是**裂项级数**，其部分和就是 $b_{N+1}-b_1$，所以它的敛散性与数列本身的收敛性完全等价——这是把"数列问题"和"级数问题"互相转化的桥梁。

@易错
1. 只验证一个方向。
2. 忘记先证 $\{b_n\}$ 单调递增（后面的两个不等式都依赖它）。
3. 必要性中用 $b_{n+1}\leqslant L$（此时还不知道有界），应当用下界 $b_{n+1}\geqslant1$。
4. 忽略 $a_n>0$（正项级数才能用比较判别法）。

[26]
@题目
设
$$f(x)=\begin{cases}\dfrac{1-\cos x}{\sqrt{x}}, & x>0\\[0pt] x^{2}\varphi(x), & x\leqslant 0\end{cases}$$
其中 $\varphi(x)$ 是有界函数，则 $f(x)$ 在 $x=0$ 处（　）.
A. 可导　　B. 连续，但不可导　　C. 极限存在，但不连续　　D. 极限不存在

@切入点
分段函数在分界点的性质，只能**回到定义**逐条验证，而且要左右分开算。题目问"可导／连续／极限"，所以按"极限 $\to$ 连续 $\to$ 可导"的顺序往上走最有条理。

两段的处理各有要点：
- $x\to0^{+}$：$\dfrac{1-\cos x}{\sqrt x}$，用等价无穷小 $1-\cos x\sim\dfrac{x^{2}}{2}$，得 $\sim\dfrac{x^{3/2}}{2}\to0$。关键是看清**分子是二阶、分母是半阶**，商是 $\frac32$ 阶的无穷小——这个"$\frac32>1$"正是后面可导的原因。
- $x\to0^{-}$：$x^{2}\varphi(x)$，$\varphi$ 只知道**有界**（没有连续性），所以只能用"有界量乘无穷小"，得极限为 $0$。凡是题目只说"有界"而不说"连续"的，就是在提示用这条。

而 $f(0)=0^{2}\varphi(0)=0$，故 $f$ 连续。

再求导数，同样左右分开，用定义：
$$f'_+(0)=\lim_{x\to0^{+}}\frac{1-\cos x}{x\sqrt x}=\lim\frac{x^{2}/2}{x^{3/2}}=0, 
f'_-(0)=\lim_{x\to0^{-}}\frac{x^{2}\varphi(x)}{x}=\lim x\varphi(x)=0 .$$
两者相等，故可导。

@解答
先看连续性。$f(0)=0^{2}\varphi(0)=0$。

$x\to0^{+}$ 时，由 $1-\cos x\sim\dfrac{x^{2}}{2}$，
$$\lim_{x\to0^{+}}\frac{1-\cos x}{\sqrt x}=\lim_{x\to0^{+}}\frac{x^{2}/2}{x^{1/2}}=\lim_{x\to0^{+}}\frac{x^{3/2}}{2}=0 .$$
$x\to0^{-}$ 时，$\varphi$ 有界（设 $|\varphi|\leqslant M$），故 $|x^{2}\varphi(x)|\leqslant Mx^{2}\to0$，即
$$\lim_{x\to0^{-}}f(x)=0 .$$
两个单侧极限都等于 $f(0)=0$，故 $f$ 在 $x=0$ 处连续。

再看可导性，用定义：
$$f'_{+}(0)=\lim_{x\to0^{+}}\frac{f(x)-f(0)}{x}=\lim_{x\to0^{+}}\frac{1-\cos x}{x\sqrt x}=\lim_{x\to0^{+}}\frac{x^{2}/2}{x^{3/2}}=\lim_{x\to0^{+}}\frac{\sqrt x}{2}=0 ,$$
$$f'_{-}(0)=\lim_{x\to0^{-}}\frac{x^{2}\varphi(x)}{x}=\lim_{x\to0^{-}}x\varphi(x)=0  (\text{有界量乘无穷小}) .$$
左右导数都存在且相等，故 $f'(0)=0$ 存在，$f$ 在 $x=0$ 处可导。

选 **A**。

@考点
分段函数在分界点处连续性与可导性的定义验证；等价无穷小 $1-\cos x\sim\frac{x^{2}}{2}$；"有界量乘无穷小仍为无穷小"；左右导数都存在且相等才可导。

易混：$\varphi$ 只假设**有界**，不能假设它连续或可导，因此 $x\leqslant0$ 一侧只能用夹逼／有界性论证，不能对 $x^{2}\varphi(x)$ 用乘积求导法则。

@易错
1. 对 $x^{2}\varphi(x)$ 用乘积求导法则（需要 $\varphi$ 可导）。
2. 求 $f'_+(0)$ 时把分母写成 $\sqrt x$ 而不是 $x\sqrt x$。
3. 只验证连续就选 B。
4. 把 $1-\cos x$ 的等价无穷小记成 $x^{2}$。

[27]
@题目
设 $\displaystyle f(x)=\lim_{t\to+\infty}\frac{x+2^{x}}{1+2^{tx}}$，则 $\displaystyle F(x)=\int_{-1}^{x}f(t)\,\mathrm{d}t$ 在 $x=0$ 处（　）.
A. 可导　　B. 间断点　　C. 不可导但连续　　D. 无法判定

@切入点
这是"含参极限定义的分段函数 $+$ 变限积分"的组合题，必须**先把 $f$ 的真面目算出来**，才能谈 $F$ 的性质。

求 $f$ 的关键是看 $2^{tx}$ 当 $t\to+\infty$ 时的行为，它完全由**指数的符号**决定，所以按 $x>0$、$x=0$、$x<0$ 分三段：
- $x>0$：$2^{tx}\to+\infty$，分母趋于无穷，$f=0$；
- $x<0$：$2^{tx}\to0$，分母趋于 $1$，$f=x+2^{x}$；
- $x=0$：直接代入得 $\dfrac{0+1}{1+1}=\dfrac12$。

于是 $f$ 在 $x=0$ 处有**跳跃间断点**（左极限 $1$、右极限 $0$、函数值 $\frac12$）。

接着看 $F(x)=\int_{-1}^{x}f$。这里要用两条结论：
1. 被积函数**有界且只有有限个间断点** $\Rightarrow$ 变限积分**连续**（间断点不影响积分的连续性）；
2. 被积函数在某点**连续** $\Rightarrow$ 变限积分在该点可导且导数为 $f$；在跳跃间断点处，变限积分的**左右导数分别等于 $f$ 的左右极限**。

第 2 条就是本题的答案来源：$F'_-(0)=f(0^{-})=1\neq0=f(0^{+})=F'_+(0)$，左右导数不等，故连续但不可导。

记住这个一般规律：**变限积分把"跳跃间断"升级成"连续但有尖点"**，光滑度提高一级。

@解答
先求 $f$。由 $2^{tx}$ 在 $t\to+\infty$ 时的极限分三种情形：
$$f(x)=\begin{cases}x+2^{x},&x<0,\\[2pt] \dfrac{0+2^{0}}{1+2^{0}}=\dfrac12,&x=0,\\[4pt] 0,&x>0 .\end{cases}$$
故 $f$ 在 $x=0$ 处跳跃间断：$f(0^{-})=0+1=1$，$f(0^{+})=0$。

$f$ 在 $[-1,+\infty)$ 上有界且只有 $x=0$ 一个间断点，故 $F(x)=\displaystyle\int_{-1}^{x}f(t)dt$ 处处连续。

再看 $x=0$ 处的导数。由变限积分的左右导数等于被积函数的左右极限：
$$F'_{-}(0)=\lim_{x\to0^{-}}\frac{1}{x}\int_{0}^{x}f(t)dt=f(0^{-})=1, 
F'_{+}(0)=f(0^{+})=0 .$$
两者不相等，故 $F$ 在 $x=0$ 处不可导。

综上，$F$ 在 $x=0$ 处连续但不可导，选 **C**。

@考点
含参数极限确定的分段函数；变限积分的连续性（被积函数有界且只有有限个间断点即可）与可导性（被积函数连续才可导）；跳跃间断点处变限积分的左右导数。

易混：$f$ 在 $x=0$ 处的**函数值** $\frac12$ 与两个单侧极限都不同，但它不影响积分（改变有限个点的值不改变积分），所以 $F$ 的左右导数由单侧**极限**决定，与 $f(0)$ 无关。

@易错
1. 求 $f$ 时漏掉 $x=0$ 的情形，或把 $x<0$ 与 $x>0$ 的结果弄反。
2. 认为被积函数间断则变限积分也间断。
3. 用 $F'(0)=f(0)=\frac12$ 得出"可导"。
4. 误以为 $f$ 无界。

[28]
@题目
设 $\alpha = (k,0,\cdots,0,k)^{\mathrm{T}}\ (k \neq 0)$，且
$$A = E - \alpha\alpha^{\mathrm{T}}, \qquad A^{-1} = E + \frac{1}{k}\alpha\alpha^{\mathrm{T}}$$
则 $k = \underline{\hspace{2cm}}$.

@切入点
题目给出了 $A$ 和它的逆，那么唯一可用的关系就是
$$AA^{-1}=E .$$
把两个表达式乘开即可。乘开的关键技巧是处理 $\alpha\alpha^{\mathrm T}\alpha\alpha^{\mathrm T}$：中间的 $\alpha^{\mathrm T}\alpha$ 是一个**数**，可以提出来，
$$(\alpha\alpha^{\mathrm T})(\alpha\alpha^{\mathrm T})=\alpha(\alpha^{\mathrm T}\alpha)\alpha^{\mathrm T}=(\alpha^{\mathrm T}\alpha) \alpha\alpha^{\mathrm T} .$$
这是所有"秩 $1$ 矩阵 $\alpha\alpha^{\mathrm T}$"问题的核心手法：$\alpha^{\mathrm T}\alpha$ 是标量、$\alpha\alpha^{\mathrm T}$ 是矩阵，两者形状相反，千万不能混。

本题 $\alpha=(k,0,\cdots,0,k)^{\mathrm T}$，故 $\alpha^{\mathrm T}\alpha=k^{2}+k^{2}=2k^{2}$。

乘开后所有项都形如 $cE$ 或 $c \alpha\alpha^{\mathrm T}$，而 $\alpha\alpha^{\mathrm T}\neq O$（$k\neq0$），所以它的系数必须为零，得到关于 $k$ 的方程。

@解答
因 $\alpha=(k,0,\cdots,0,k)^{\mathrm T}$，有
$$\alpha^{\mathrm T}\alpha=k^{2}+k^{2}=2k^{2} .$$
由 $AA^{-1}=E$：
$$(E-\alpha\alpha^{\mathrm T})(E+\frac1k\alpha\alpha^{\mathrm T})
=E+\frac1k\alpha\alpha^{\mathrm T}-\alpha\alpha^{\mathrm T}-\frac1k(\alpha\alpha^{\mathrm T})(\alpha\alpha^{\mathrm T}) .$$
其中
$$(\alpha\alpha^{\mathrm T})(\alpha\alpha^{\mathrm T})=\alpha(\alpha^{\mathrm T}\alpha)\alpha^{\mathrm T}=2k^{2}\alpha\alpha^{\mathrm T} ,$$
故
$$AA^{-1}=E+(\frac1k-1-2k)\alpha\alpha^{\mathrm T} .$$
因 $k\neq0$ 时 $\alpha\alpha^{\mathrm T}\neq O$，要使上式等于 $E$，必须
$$\frac1k-1-2k=0\Longleftrightarrow 2k^{2}+k-1=0\Longleftrightarrow (2k-1)(k+1)=0 ,$$
即
$$k=\frac12 \text{或}  k=-1 .$$

@考点
秩 $1$ 矩阵 $\alpha\alpha^{\mathrm T}$ 的运算规律：$(\alpha\alpha^{\mathrm T})^{2}=(\alpha^{\mathrm T}\alpha)\alpha\alpha^{\mathrm T}$；逆矩阵的定义式 $AA^{-1}=E$；$\alpha^{\mathrm T}\alpha$ 是数而 $\alpha\alpha^{\mathrm T}$ 是矩阵。

易混：$\alpha^{\mathrm T}\alpha=|\alpha|^{2}$（一个数），$\alpha\alpha^{\mathrm T}$ 是 $n$ 阶矩阵且秩为 $1$、迹等于 $\alpha^{\mathrm T}\alpha$；两者位置颠倒结果完全不同。

@易错
1. 把 $(\alpha\alpha^{\mathrm T})^{2}$ 当成 $\alpha^{2}(\alpha^{\mathrm T})^{2}$ 或直接约掉。
2. $\alpha^{\mathrm T}\alpha$ 算成 $k^{2}$（漏掉第二个非零分量）或 $2k$。
3. 解方程时漏根，只写 $k=\frac12$。
4. 忘记 $k\neq0$ 这一前提（它保证 $\alpha\alpha^{\mathrm T}\neq O$，从而系数必须为零）。

[29]
@题目
设二维随机变量 $(X,Y)$ 的概率密度为
$$f(x,y)=\begin{cases}k\mathrm e^{-(4x+3y)},&x>0,y>0,\\0,&\text{其他}.\end{cases}$$
求：（Ⅰ）常数 $k$ 的值，并判别 $X$ 与 $Y$ 是否相互独立，说明理由；
（Ⅱ）$Z=X+Y$ 的概率密度 $f_Z(z)$.

@切入点
（Ⅰ）定常数永远是用**归一性** $\displaystyle\iint f=1$。这里被积函数在第一象限上可以写成 $\mathrm e^{-4x}\cdot\mathrm e^{-3y}$，积分区域又是矩形（第一象限），所以二重积分**直接分离成两个一元积分之积**：
$$k\int_{0}^{+\infty}\mathrm e^{-4x}dx\int_{0}^{+\infty}\mathrm e^{-3y}dy=\frac{k}{12}=1 .$$

独立性判别在这里非常轻松，因为同时满足两个条件：密度能写成 $g(x)h(y)$ 的形式，**且**支撑是矩形区域（第一象限 $=(0,+\infty)\times(0,+\infty)$）。这两条一起才是独立的充要条件（对比本册第 14 题，那里支撑是三角形，就不独立）。分离出来还能直接读出 $X\sim E(4)$、$Y\sim E(3)$。

（Ⅱ）$Z=X+Y$ 用卷积公式，独立时
$$f_Z(z)=\int_{-\infty}^{+\infty}f_X(x)f_Y(z-x)dx .$$
定限时要同时满足 $x>0$ 与 $z-x>0$，即 $0<x<z$（需 $z>0$）。被积函数是两个指数相乘，积出来是 $\mathrm e^{-3z}$ 与 $\mathrm e^{-4z}$ 之差——这是两个参数不同的指数分布之和的标准形式。

@解答
（Ⅰ）由归一性
$$1=\iint_{\mathbb R^{2}}f(x,y)dxdy=k\int_{0}^{+\infty}\mathrm e^{-4x}dx\int_{0}^{+\infty}\mathrm e^{-3y}dy=k\cdot\frac14\cdot\frac13=\frac{k}{12} ,$$
故 $k=12$。此时
$$f(x,y)=12\mathrm e^{-4x}\mathrm e^{-3y}=(4\mathrm e^{-4x})(3\mathrm e^{-3y}) (x>0,y>0) ,$$
边缘密度分别为
$$f_X(x)=4\mathrm e^{-4x}\ (x>0),  f_Y(y)=3\mathrm e^{-3y}\ (y>0) ,$$
且对一切 $(x,y)$ 都有 $f(x,y)=f_X(x)f_Y(y)$（支撑为矩形区域），故 $X$ 与 $Y$ **相互独立**，且 $X\sim E(4)$，$Y\sim E(3)$。

（Ⅱ）由卷积公式，被积函数非零要求 $x>0$ 且 $z-x>0$，故当 $z>0$ 时
$$f_Z(z)=\int_{0}^{z}4\mathrm e^{-4x}\cdot3\mathrm e^{-3(z-x)}dx=12\mathrm e^{-3z}\int_{0}^{z}\mathrm e^{-x}dx=12\mathrm e^{-3z}(1-\mathrm e^{-z}) ,$$
即
$$f_Z(z)=\begin{cases}12(\mathrm e^{-3z}-\mathrm e^{-4z}),&z>0,\\ 0,&z\leqslant0 .\end{cases}$$

@考点
概率密度的归一性定常数；独立性的充要判据（密度可分离 **且** 支撑为矩形）；指数分布；独立随机变量之和的卷积公式。

易混：判独立不能只看密度表达式能否分离，还要看支撑；反过来，本题支撑与表达式都满足，所以可以放心地下结论。

@易错
1. 归一时积分限写错（应在第一象限）。
2. 卷积上限写成 $+\infty$，漏掉 $z-x>0$。
3. 忘记 $z\leqslant0$ 时 $f_Z=0$。
4. 把 $\int_0^{+\infty}\mathrm e^{-4x}dx$ 算成 $4$（应为 $\frac14$）。

[30]
@题目
设平面力 $\mathbf F(x,y)=(P(x,y),Q(x,y))$，其中 $P(x,y)=f(x)+y[e^{-x}-f'(x)]$，$Q(x,y)=\underline{\quad}$（此处待核对），$f(x)$ 有二阶连续导数，且 $f'(0)=0$．
（Ⅰ）若力 $\mathbf F$ 对运动质点所做的功与质点运动路径无关，求 $f(x)$；
（Ⅱ）在（Ⅰ）的基础上，若 $L$ 是从点 $A(-1,1)$ 到点 $B(1,0)$ 的光滑有向曲线，且 $\displaystyle\int_L P\,dx+Q\,dy=\frac{4}{e}$，求 $f(x)$ 的极值．

@切入点
这道题的 $Q(x,y)$ 在摘录中缺失，但整题的**方法主线**是完整且标准的，值得把思路走一遍：

（Ⅰ）"做功与路径无关"的充要条件是
$$\frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x} .$$
题中 $P=f(x)+y[\mathrm e^{-x}-f'(x)]$，故
$$\frac{\partial P}{\partial y}=\mathrm e^{-x}-f'(x) .$$
把它与 $\dfrac{\partial Q}{\partial x}$ 相等，就会得到一个关于 $f$ 的**微分方程**（通常是二阶常系数非齐次的），再用条件 $f'(0)=0$ 定常数。这就是"由路径无关条件反解未知函数"的标准套路：**路径无关条件就是待解的微分方程**。

（Ⅱ）路径无关后功等于势函数的增量：先求势函数 $u(x,y)$（由 $u_x=P$ 积分、再用 $u_y=Q$ 定待定函数），再由
$$u(1,0)-u(-1,1)=\frac{4}{\mathrm e}$$
定出（Ⅰ）中剩下的那个任意常数。最后按常规做法求极值：解 $f'(x)=0$ 得驻点，用 $f''$ 的符号判别极大还是极小。

**题干缺失说明**：$Q(x,y)$ 的表达式在原始摘录中缺失，因此无法给出确定的 $f(x)$ 与极值，请对照原书补全后按上述步骤计算。

@解答
（方法完整，结果依赖缺失的 $Q$。）

（Ⅰ）记 $P(x,y)=f(x)+y[\mathrm e^{-x}-f'(x)]$，则
$$\frac{\partial P}{\partial y}=\mathrm e^{-x}-f'(x) .$$
$\mathbf F$ 做功与路径无关的充要条件为 $\dfrac{\partial P}{\partial y}=\dfrac{\partial Q}{\partial x}$，即
$$\mathrm e^{-x}-f'(x)=\frac{\partial Q}{\partial x} .$$
把 $Q$ 的表达式代入并整理，即得关于 $f$ 的微分方程；解之并用 $f'(0)=0$ 确定一个常数，得到含一个待定常数的 $f(x)$。

（Ⅱ）由路径无关，存在势函数 $u(x,y)$ 满足 $u_x=P$，$u_y=Q$：先对 $P$ 关于 $x$ 积分得 $u$（含待定函数 $\varphi(y)$），再由 $u_y=Q$ 定出 $\varphi$。于是
$$\int_L P dx+Q dy=u(1,0)-u(-1,1)=\frac{4}{\mathrm e} ,$$
由此定出（Ⅰ）中剩余的常数，$f(x)$ 完全确定。最后解 $f'(x)=0$ 求驻点，由 $f''$ 的符号判定极大值或极小值。

**注**：原始摘录中 $Q(x,y)$ 的表达式缺失，故无法给出数值结果，请对照原书补全。

@考点
平面曲线积分与路径无关的充要条件 $\frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x}$；由该条件建立并求解微分方程；势函数法计算做功；函数极值的判定。

易混：判别路径无关用的是 $\frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x}$（$P$ 对 $y$、$Q$ 对 $x$），与格林公式中的 $\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}$ 是同一组偏导，但用途不同。

@易错
1. 把 $\frac{\partial P}{\partial y}$ 与 $\frac{\partial Q}{\partial x}$ 的角色弄反。
2. 求势函数时把待定函数写成常数。
3. 解出 $f$ 后忘记用 $f'(0)=0$ 与积分值两个条件定两个常数。
4. 求极值时只找驻点不判别。

[31]
@题目
设随机变量 $X_i$ 服从二项分布 $B(i,0.2)$，$i=1,2,\cdots,10$，且 $X_1,X_2,\cdots,X_{10}$ 相互独立，则根据切比雪夫不等式，有
$$P\Big\{6<\sum_{i=1}^{10}X_i<16\Big\}\geqslant\underline{\hspace{3em}}.$$

@切入点
题目明确要求用**切比雪夫不等式**
$$P\{|X-EX|<\varepsilon\}\geqslant1-\frac{DX}{\varepsilon^{2}} ,$$
所以全部工作就三步：算 $E$、算 $D$、把区间写成"以均值为中心的对称区间"。

第三步是关键的形式转换：$6<\sum X_i<16$ 看起来和均值没关系，但算出 $E\sum X_i=11$ 后就会发现 $11$ 恰是区间中点，于是
$$\{6<\textstyle\sum X_i<16\}=\{|\textstyle\sum X_i-11|<5\} ,$$
正好套上公式，$\varepsilon=5$。题目把区间设计成关于均值对称，就是为了让切比雪夫不等式能用。

算 $E$、$D$ 时用到二项分布 $B(i,p)$ 的 $EX_i=ip$、$DX_i=ip(1-p)$，以及独立性使方差可加（**期望不需要独立性，方差需要**）。还要用到 $\sum_{i=1}^{10}i=55$。

@解答
$X_i\sim B(i,0.2)$，故 $EX_i=0.2i$，$DX_i=i\cdot0.2\cdot0.8=0.16i$。记 $S=\displaystyle\sum_{i=1}^{10}X_i$。由 $\displaystyle\sum_{i=1}^{10}i=55$，
$$ES=0.2\times55=11 ,$$
又 $X_1,\cdots,X_{10}$ 相互独立，方差可加：
$$DS=0.16\times55=8.8 .$$
注意 $11$ 是区间 $(6,16)$ 的中点，故
$$P\{6<S<16\}=P\{|S-11|<5\} .$$
由切比雪夫不等式（取 $\varepsilon=5$）
$$P\{|S-11|<5\}\geqslant1-\frac{DS}{5^{2}}=1-\frac{8.8}{25}=1-0.352=0.648 .$$
故所填为 $0.648$。

@考点
切比雪夫不等式；二项分布的期望与方差；独立随机变量和的方差可加；把给定区间改写成以均值为中心的对称区间。

易混：期望的可加性对任意随机变量都成立，方差的可加性**需要独立（或至少两两不相关）**；本题题设明确给出独立。

@易错
1. 把 $DX_i$ 写成 $ip^{2}$ 或 $0.2\times0.8=0.16$（漏掉 $i$）。
2. $\sum_{i=1}^{10}i$ 算成 $45$ 或 $50$。
3. $\varepsilon$ 取成 $10$（区间长度）而不是 $5$（半径）。
4. 不等号方向写反，或用成 $P\{|S-ES|\geqslant\varepsilon\}\leqslant\frac{DS}{\varepsilon^{2}}$ 后忘了取补。

[32]
@题目
设 $A$ 是 $n$ 阶方阵，将 $A$ 的第 $i$ 列与第 $j$ 列互换，再交换第 $i$ 行与第 $j$ 行得到 $B$，则（　　）.
A. $A$ 与 $B$ 等价、相似且合同
B. $A$ 与 $B$ 相似、合同但不等价
C. $A$ 与 $B$ 相似但不合同
D. $A$ 与 $B$ 等价但不相似

@切入点
先把题目的两步操作翻译成矩阵乘法。设 $P$ 是交换第 $i,j$ 两行（或两列）对应的初等（对换）矩阵，则：
- 交换第 $i,j$ **列** $\Rightarrow$ 右乘 $P$：$A\to AP$；
- 交换第 $i,j$ **行** $\Rightarrow$ 左乘 $P$：$AP\to PAP$。

所以 $B=PAP$。

接下来的全部关键是**对换矩阵的三重身份**：
$$P^{\mathrm T}=P,  P^{2}=E\ \text{即}\ P^{-1}=P .$$
于是同一个式子 $B=PAP$ 可以读成三种关系：
$$B=P^{-1}AP\ (\text{相似}),  B=P^{\mathrm T}AP\ (\text{合同}),  B=PAP\ (\text{两个可逆矩阵相乘，故等价}) .$$
三者同时成立，选 A。

这道题的价值在于把"等价、相似、合同"三个概念放在一起对比：它们分别对应 $B=PAQ$（$P,Q$ 可逆）、$B=P^{-1}AP$、$B=P^{\mathrm T}AP$，而**当 $P$ 是正交矩阵时 $P^{-1}=P^{\mathrm T}$，相似与合同就重合了**——对换矩阵正是正交矩阵。

@解答
设 $P$ 为交换第 $i,j$ 两行（列）的初等对换矩阵。交换 $A$ 的第 $i,j$ 列相当于右乘 $P$，再交换第 $i,j$ 行相当于左乘 $P$，故
$$B=PAP .$$
对换矩阵满足
$$P^{\mathrm T}=P,  P^{2}=E\ \Longrightarrow\ P^{-1}=P .$$
于是
$$B=P^{-1}AP (A\ \text{与}\ B\ \text{相似}),  B=P^{\mathrm T}AP (A\ \text{与}\ B\ \text{合同}),$$
又 $P$ 可逆，$B=PAP$ 的形式说明 $A$ 与 $B$ 等价。

三者同时成立，故选 **A**。

@考点
初等变换与初等矩阵（左行右列）；对换矩阵是对称的正交矩阵（$P^{\mathrm T}=P=P^{-1}$）；等价、相似、合同三种关系的定义与联系。

易混：相似要求 $B=P^{-1}AP$，合同要求 $B=P^{\mathrm T}AP$，一般两者互不蕴含；只有当 $P$ 为**正交矩阵**时二者一致。另外相似或合同都蕴含等价，但反之不成立。

@易错
1. 只想到等价，忽略对换矩阵的特殊性质，选 D。
2. 把行、列变换的左右乘搞反（本题因 $P$ 在两侧对称，结果不变，但推理要正确）。
3. 认为合同要求 $A$ 对称——合同关系的定义不要求矩阵对称（虽然它主要用于二次型）。

[33]
@题目
设 $\displaystyle f(x)=\int_{0}^{a-x}e^{t(2a-t)}\,\mathrm{d}t$（$a>0$），$x\in[0,a]$，则曲线 $y=f(x)$ 与两坐标轴所围成图形的面积为 ______.

@切入点
先弄清图形：$f(x)=\displaystyle\int_0^{a-x}\mathrm e^{t(2a-t)}dt$，被积函数恒正，且上限 $a-x$ 随 $x$ 增大而减小，所以 $f$ 单调递减；又 $f(a)=\int_0^0=0$，$f(0)>0$。于是曲线在 $[0,a]$ 上从正值单调降到 $0$，与两坐标轴围成的面积就是
$$S=\int_{0}^{a}f(x)dx .$$

直接积分是做不到的（$\mathrm e^{t(2a-t)}$ 没有初等原函数），所以必须**分部积分**把变限积分"打开"。分部时取 $u=f(x)$、$dv=dx$：
$$\int_{0}^{a}f(x)dx=[xf(x)]_{0}^{a}-\int_{0}^{a}xf'(x)dx .$$
边界项因 $f(a)=0$ 而消失，剩下的 $f'(x)$ 由变限积分求导给出
$$f'(x)=\mathrm e^{(a-x)[2a-(a-x)]}\cdot(-1)=-\mathrm e^{a^{2}-x^{2}} ,$$
指数里 $(a-x)(a+x)=a^{2}-x^{2}$ 恰好凑成可积的形式！于是剩下的积分变成 $\int x\mathrm e^{-x^{2}}dx$ 型，凑微分即可。

"遇到含变限积分的定积分，先分部积分把它转成对被积函数的积分"是这类题的固定招式。

@解答
因被积函数 $\mathrm e^{t(2a-t)}>0$，且 $f(a)=\displaystyle\int_0^0=0$，$f$ 在 $[0,a]$ 上单调递减、非负，故所求面积
$$S=\int_{0}^{a}f(x)dx .$$
由变限积分求导
$$f'(x)=\mathrm e^{(a-x)[2a-(a-x)]}\cdot(a-x)'=-\mathrm e^{(a-x)(a+x)}=-\mathrm e^{a^{2}-x^{2}} .$$
分部积分：
$$S=[xf(x)]_{0}^{a}-\int_{0}^{a}xf'(x)dx=(a\cdot0-0)+\int_{0}^{a}x\mathrm e^{a^{2}-x^{2}}dx .$$
凑微分：
$$\int_{0}^{a}x\mathrm e^{a^{2}-x^{2}}dx=\mathrm e^{a^{2}}\int_{0}^{a}x\mathrm e^{-x^{2}}dx=\mathrm e^{a^{2}}[-\frac12\mathrm e^{-x^{2}}]_{0}^{a}=\frac{\mathrm e^{a^{2}}}{2}(1-\mathrm e^{-a^{2}}) .$$
故
$$S=\frac{\mathrm e^{a^{2}}-1}{2} .$$

@考点
变限积分求导（上限为复合函数时要乘内层导数）；分部积分处理"对变限积分再积分"；凑微分 $x dx=-\frac12d(x^{2})$；识别无初等原函数的被积函数。

易混：$f'(x)$ 中的负号来自上限 $a-x$ 对 $x$ 的导数 $-1$，很容易漏；而分部积分里又有一个负号，两者相乘变正，最终 $S>0$，可用作检验。

@易错
1. 试图先算出 $f(x)$ 的显式表达式。
2. 变限积分求导时漏掉内层导数 $-1$。
3. 分部积分的边界项算错（需用 $f(a)=0$）。
4. 没注意到 $(a-x)(a+x)=a^{2}-x^{2}$，错失凑微分的机会。

[34]
@题目
设 $D$ 是由曲线 $|x|y+|x|+y=1$ 与 $x$ 轴所围成的有界区域，计算
$$I=\iint_{D}[2\ln(1+y)-y+x]\mathrm{d}x\mathrm{d}y.$$

@切入点
先把区域看清楚。曲线 $|x|y+|x|+y=1$ 解出
$$y=\frac{1-|x|}{1+|x|} ,$$
它关于 $y$ 轴对称，在 $x=0$ 处取最大值 $1$，在 $x=\pm1$ 处降到 $0$。$D$ 就是这条曲线与 $x$ 轴围成的"帽子形"区域，$-1\leqslant x\leqslant1$，$0\leqslant y\leqslant\dfrac{1-|x|}{1+|x|}$。

第一刀：**对称性**。$D$ 关于 $y$ 轴对称，被积函数中的 $x$ 是奇函数，故 $\displaystyle\iint_Dx dxdy=0$，直接砍掉一项；剩下的部分关于 $x$ 是偶的，可以只算右半再乘 $2$。

第二刀：**积分次序**。剩下的被积函数 $2\ln(1+y)-y$ 只含 $y$，但积分上限 $g(x)=\frac{1-x}{1+x}$ 含 $x$，所以先对 $y$ 积分（内层）、再对 $x$ 积分（外层）比较自然。内层积出来是 $G$ 的函数，其中 $G=g(x)$。

第三刀：**换元 $u=1+x$**。因为 $g(x)=\frac{2-u}{u}=\frac2u-1$，$1+g=\frac2u$，代入后所有项都成为 $u$ 的初等函数（含 $\frac{\ln(2/u)}{u}$ 这种可凑微分的形状），外层积分就能算出来。这一步换元是本题计算能顺利完成的关键。

@解答
曲线即 $y=\dfrac{1-|x|}{1+|x|}$（$|x|\leqslant1$），$D$ 关于 $y$ 轴对称。因 $x$ 关于 $x$ 为奇函数，
$$\iint_{D}x dxdy=0 .$$
其余部分关于 $x$ 为偶，故
$$I=2\int_{0}^{1}dx\int_{0}^{g(x)}[2\ln(1+y)-y]dy,  g(x)=\frac{1-x}{1+x} .$$

内层（记 $G=g(x)$）：由 $\displaystyle\int_0^G2\ln(1+y)dy=2[(1+y)\ln(1+y)-y]_0^G=2(1+G)\ln(1+G)-2G$，
$$\int_{0}^{G}[2\ln(1+y)-y]dy=2(1+G)\ln(1+G)-2G-\frac{G^{2}}{2} .$$

令 $u=1+x\in[1,2]$，则 $G=\dfrac2u-1$，$1+G=\dfrac2u$，代入整理得
$$2(1+G)\ln(1+G)-2G-\frac{G^{2}}{2}=\frac4u\ln\frac2u-\frac2u-\frac{2}{u^{2}}+\frac32 .$$
于是
$$I=2\int_{1}^{2}(\frac4u\ln\frac2u-\frac2u-\frac{2}{u^{2}}+\frac32)du .$$
逐项计算（第一项令 $w=\ln\frac2u$，$dw=-\frac{du}{u}$）：
$$\int_{1}^{2}\frac4u\ln\frac2u du=\int_{\ln2}^{0}4w(-dw)=2(\ln2)^{2},  \int_{1}^{2}\frac2u du=2\ln2,$$
$$\int_{1}^{2}\frac{2}{u^{2}}du=1,  \int_{1}^{2}\frac32du=\frac32 .$$
故
$$I=2[2(\ln2)^{2}-2\ln2-1+\frac32]=4(\ln2)^{2}-4\ln2+1=(2\ln2-1)^{2} .$$

@考点
含绝对值的曲线所围区域；二重积分的对称性化简；累次积分的次序选择；换元 $u=1+x$ 简化外层积分；$\int\ln(1+y)dy=(1+y)\ln(1+y)-y$。

易混：利用对称性时，"区域关于 $y$ 轴对称 $+$ 被积函数关于 $x$ 为奇"给出积分为零；"关于 $x$ 为偶"给出两倍右半——两条要分开对被积函数的不同部分使用。

@易错
1. 忘记用对称性砍掉 $x$ 项，直接硬算。
2. 把区域边界写成 $y=1-|x|$（少了分母）。
3. 内层积分中 $\int\ln(1+y)dy$ 的原函数记错。
4. 外层换元后上下限没换。

[35]
@题目
设 $A, B$ 分别为 $m \times n$ 与 $n \times s$ 矩阵，且 $\mathrm{r}(A) = n$，则下列选项中正确的是（　　）.
A. $AB$ 的列向量组与 $B$ 的列向量组等价　B. $AB$ 的行向量组与 $B$ 的行向量组等价
C. $AB$ 的列向量组与 $A$ 的列向量组等价　D. $AB$ 的行向量组与 $A$ 的行向量组等价

@切入点
四个选项在"行向量组／列向量组"和"$A$／$B$"之间排列组合，先用**维数**排除一半：
- $AB$ 是 $m\times s$，它的**列**向量是 $m$ 维、**行**向量是 $s$ 维；
- $A$ 是 $m\times n$：列向量 $m$ 维、行向量 $n$ 维；
- $B$ 是 $n\times s$：列向量 $n$ 维、行向量 $s$ 维。

"两个向量组等价"要求它们在**同一个向量空间**里，所以：A（$m$ 维 vs $n$ 维）、D（$s$ 维 vs $n$ 维）一般维数就对不上，直接排除。剩下 B（都是 $s$ 维行向量）和 C（都是 $m$ 维列向量）。

再看条件 $\mathrm r(A)=n$，即 $A$ **列满秩**。列满秩的核心性质是"**存在左逆**"：存在 $n\times m$ 矩阵 $C$ 使 $CA=E_n$。有了它就能做双向表出：
- $AB$ 的行向量是 $B$ 的行向量的线性组合（这对任何 $A$ 都成立）；
- 反过来 $B=E_nB=(CA)B=C(AB)$，说明 $B$ 的行向量也是 $AB$ 的行向量的线性组合。

两个方向都能表出，即两行向量组等价，选 B。C 不对：$A$ 的列一般不能由 $AB$ 的列表出（取 $B=O$ 即可）。

@解答
$A$ 为 $m\times n$，$B$ 为 $n\times s$，$AB$ 为 $m\times s$。

先由维数排除：$AB$ 的列向量与 $A$ 的列向量都是 $m$ 维，$AB$ 的行向量与 $B$ 的行向量都是 $s$ 维；而 A 中 $AB$ 的列（$m$ 维）与 $B$ 的列（$n$ 维）、D 中 $AB$ 的行（$s$ 维）与 $A$ 的行（$n$ 维）一般不同维，故 A、D 不正确。

因 $\mathrm r(A)=n$（列满秩），存在 $n\times m$ 矩阵 $C$ 使 $CA=E_n$。于是

（1）$AB$ 的每一行都是 $B$ 的各行的线性组合（由矩阵乘法的行表示）；

（2）$B=E_nB=(CA)B=C(AB)$，故 $B$ 的每一行都是 $AB$ 的各行的线性组合。

两个向量组可以互相线性表出，故 $AB$ 的行向量组与 $B$ 的行向量组**等价**，选 **B**。

（C 不正确：取 $B=O$，则 $AB=O$，其列向量组不能表出 $A$ 的非零列向量组。）

@考点
矩阵乘法的行、列表示（$AB$ 的行是 $B$ 的行的组合，$AB$ 的列是 $A$ 的列的组合）；列满秩矩阵存在左逆、行满秩矩阵存在右逆；向量组等价的定义（互相线性表出）。

易混：$\mathrm r(A)=n$ 表示**列**满秩（$n$ 是列数），对应左逆 $CA=E_n$；若是行满秩 $\mathrm r(A)=m$，对应的是右逆 $AD=E_m$，能推出的是列向量组的结论。

@易错
1. 不检查维数，在 A、D 上浪费时间。
2. 把 $\mathrm r(A)=n$ 理解成行满秩。
3. 只证一个方向的表出就下"等价"的结论。
4. 选 C（忘记 $B$ 可能为零矩阵这样的反例）。

[36]
@题目
将 $f(x) = \sin \dfrac{\pi}{2} x$ 在 $x = -2$ 处进行幂级数展开.

@切入点
"在 $x=x_0$ 处展开"意味着要得到 $\sum c_n(x-x_0)^{n}$ 的形式，所以第一动作永远是**换元** $t=x-x_0$，把问题化归成在 $t=0$ 处（即麦克劳林展开）的标准情形。本题 $x_0=-2$，令 $t=x+2$。

换元后关键是把 $\sin\dfrac{\pi x}{2}$ 用 $t$ 表示并**化简**：
$$\sin\frac{\pi x}{2}=\sin\frac{\pi(t-2)}{2}=\sin(\frac{\pi t}{2}-\pi)=-\sin\frac{\pi t}{2} .$$
诱导公式把它变回一个纯粹的正弦——这一步不化简就没法用现成的展开式。

剩下的直接套 $\sin u=\sum\limits_{n=0}^{\infty}\dfrac{(-1)^{n}}{(2n+1)!}u^{2n+1}$，令 $u=\dfrac{\pi t}{2}$，最后把 $t$ 换回 $x+2$。因为 $\sin$ 的展开式对一切实数成立，收敛域是 $(-\infty,+\infty)$。

@解答
令 $t=x+2$，则 $x=t-2$，
$$f(x)=\sin\frac{\pi x}{2}=\sin\frac{\pi(t-2)}{2}=\sin(\frac{\pi t}{2}-\pi)=-\sin\frac{\pi t}{2} .$$
由 $\sin u=\displaystyle\sum_{n=0}^{\infty}\frac{(-1)^{n}}{(2n+1)!}u^{2n+1}$（$-\infty<u<+\infty$），取 $u=\dfrac{\pi t}{2}$：
$$f(x)=-\sum_{n=0}^{\infty}\frac{(-1)^{n}}{(2n+1)!}(\frac{\pi t}{2})^{2n+1}
=\sum_{n=0}^{\infty}\frac{(-1)^{n+1}\pi^{2n+1}}{2^{2n+1}(2n+1)!}(x+2)^{2n+1} ,$$
收敛域为 $(-\infty,+\infty)$。

@考点
函数在非零点处的幂级数展开（换元化为麦克劳林展开）；三角函数的诱导公式；$\sin u$ 的幂级数展开式及其收敛域。

易混：在 $x_0$ 处展开要求最终结果用 $(x-x_0)$ 的幂表示，不能留下混合的 $x$；换元后务必把 $t$ 换回来。

@易错
1. 不换元，直接对 $\sin\frac{\pi x}{2}$ 套麦克劳林展开（那是在 $x=0$ 处展开）。
2. 诱导公式用错，写成 $\sin(\frac{\pi t}{2}-\pi)=\sin\frac{\pi t}{2}$ 或 $\cos\frac{\pi t}{2}$。
3. 把 $(\frac{\pi}{2})^{2n+1}$ 写成 $\frac{\pi^{2n+1}}{2}$。
4. 忘记写收敛域。

[37]
@题目
设
$$f(x,y)=\begin{cases}y\arctan\dfrac{1}{\sqrt{x^{2}+y^{2}}}, & (x,y)\neq(0,0),\\ 0, & (x,y)=(0,0),\end{cases}$$
则 $f(x,y)$ 在点 $(0,0)$ 处（　）.
A. 连续但不可微　　B. 不连续但偏导数存在　　C. 可微　　D. 连续但偏导数不存在

@切入点
二元函数在一点的性态要逐级检验：**连续 $\to$ 偏导数存在 $\to$ 可微**。四个选项正好覆盖这三级的各种组合，所以三件事都要验一遍。

1. **连续**：$|\arctan u|<\dfrac\pi2$ 恒成立，故 $|f|\leqslant\dfrac\pi2|y|\to0=f(0,0)$，夹逼即得连续。注意这里正是"有界量乘无穷小"。
2. **偏导数**：沿坐标轴算。$f(x,0)=0\cdot\arctan(\cdots)=0$，故 $f'_x(0,0)=0$；而
$$f'_y(0,0)=\lim_{y\to0}\frac{y\arctan\frac{1}{|y|}}{y}=\lim_{y\to0}\arctan\frac{1}{|y|}=\frac\pi2\neq0 .$$
两个偏导数都存在，但值不同，这一点很容易漏算。
3. **可微**：按定义验证
$$\frac{|f(x,y)-f(0,0)-f'_x(0,0)x-f'_y(0,0)y|}{\rho}\to0 (\rho=\sqrt{x^{2}+y^{2}}) .$$
这里的巧劲是恒等式
$$\arctan\frac1\rho=\frac\pi2-\arctan\rho (\rho>0) ,$$
它把分子化成 $|y\arctan\rho|$，于是商 $\leqslant\arctan\rho\to0$，可微。不知道这个恒等式就很难估计。

@解答
记 $\rho=\sqrt{x^{2}+y^{2}}$。

（1）连续性：因 $|\arctan u|<\dfrac\pi2$，
$$|f(x,y)|\leqslant\frac\pi2|y|\to0=f(0,0) ((x,y)\to(0,0)) ,$$
故 $f$ 在 $(0,0)$ 处连续。

（2）偏导数：$f(x,0)\equiv0$，故 $f'_x(0,0)=0$；又
$$f'_y(0,0)=\lim_{y\to0}\frac{f(0,y)-f(0,0)}{y}=\lim_{y\to0}\arctan\frac{1}{|y|}=\frac\pi2 .$$
两个偏导数都存在。

（3）可微性：由 $\arctan\dfrac1\rho=\dfrac\pi2-\arctan\rho$（$\rho>0$），
$$f(x,y)-f'_x(0,0)x-f'_y(0,0)y=y\arctan\frac1\rho-\frac\pi2y=-y\arctan\rho ,$$
故
$$\frac{|f-0\cdot x-\frac\pi2y|}{\rho}=\frac{|y|\arctan\rho}{\rho}\leqslant\arctan\rho\to0 (\rho\to0^{+}) ,$$
即 $f$ 在 $(0,0)$ 处**可微**（且 $df|_{(0,0)}=\frac\pi2dy$）。

选 **C**。

@考点
二元函数连续、偏导数存在、可微的定义与逐级验证；可微性定义中"误差比 $\rho$ 趋于零"的检验；恒等式 $\arctan u+\arctan\frac1u=\frac\pi2$（$u>0$）。

易混：可微 $\Rightarrow$ 连续且偏导数存在，反之都不成立；本题三者都成立，但必须逐条验证，不能因为"连续且偏导存在"就断定可微。

@易错
1. $f'_y(0,0)$ 算成 $0$（忽略了 $\arctan\frac{1}{|y|}\to\frac\pi2$ 而非 $0$）。
2. 验可微时用错线性主部（应减去 $\frac\pi2y$ 而不是 $0$）。
3. 不知道 $\arctan\frac1\rho=\frac\pi2-\arctan\rho$，估计不出分子的阶。
4. 由"偏导数不连续"错误地断定不可微（偏导数连续只是可微的充分条件）。

[38]
@题目
设 $(X,Y)$ 服从二维正态分布，则 $U=X+Y$ 与 $V=X-Y$ 不相关的充分必要条件是（　　）.
A. $EX=EY$
B. $E(X^2)=E(Y^2)$
C. $E(X^2)+(EY)^2=E(Y^2)+(EX)^2$
D. $E(X^2)+(EX)^2=E(Y^2)+(EY)^2$

@切入点
"不相关"就是协方差为零，所以直接展开
$$\mathrm{Cov}(X+Y,X-Y)=\mathrm{Cov}(X,X)-\mathrm{Cov}(X,Y)+\mathrm{Cov}(Y,X)-\mathrm{Cov}(Y,Y)=DX-DY .$$
中间两项恰好抵消（协方差对称），这是本题的全部运算量。于是条件化为
$$DX=DY .$$

剩下的工作是把 $DX=DY$ 翻译成四个选项里的形式。用 $DX=EX^{2}-(EX)^{2}$：
$$EX^{2}-(EX)^{2}=EY^{2}-(EY)^{2}\Longleftrightarrow EX^{2}+(EY)^{2}=EY^{2}+(EX)^{2} ,$$
即选项 C。注意移项时是把 $-(EY)^2$ 移到左边成 $+(EY)^2$——D 选项正是把符号弄错的干扰项。

再检查其他选项：A（均值相等）与 B（二阶矩相等）单独都推不出方差相等，只有两者**同时**成立才行，所以都只是充分不必要或既不充分也不必要。

@解答
由协方差的双线性性与对称性，
$$\mathrm{Cov}(U,V)=\mathrm{Cov}(X+Y,X-Y)=DX-\mathrm{Cov}(X,Y)+\mathrm{Cov}(Y,X)-DY=DX-DY .$$
故
$$U\ \text{与}\ V\ \text{不相关}\Longleftrightarrow \mathrm{Cov}(U,V)=0\Longleftrightarrow DX=DY .$$
又
$$DX=DY\Longleftrightarrow E(X^{2})-(EX)^{2}=E(Y^{2})-(EY)^{2}\Longleftrightarrow E(X^{2})+(EY)^{2}=E(Y^{2})+(EX)^{2} .$$
故选 **C**。

@考点
协方差的双线性性与对称性；$DX=EX^{2}-(EX)^{2}$；不相关的定义。

易混：本题结论只需要"不相关"，不需要用到二维正态这个条件；不过对二维正态而言，不相关等价于独立，所以 $U,V$ 不相关时还进一步独立。

@易错
1. 展开时漏掉中间两项相消的过程，误得 $DX+DY$。
2. 移项时符号出错，选 D。
3. 误以为要 $EX=EY$（选 A）。

[39]
@题目
设 $f(x,y)$ 在 $\dfrac{x^2}{4}+y^2\leqslant 1$ 上有二阶偏导数，$L$ 为 $\dfrac{x^2}{4}+y^2=1$，取顺时针方向，计算
$$I=\oint_L [-3y+f'_x(x,y)]\,dx+f'_y(x,y)\,dy$$

@切入点
把被积表达式**分成两部分**看，这是本题的关键一步：
$$\oint_L[-3y+f'_x]dx+f'_ydy=\oint_L(-3y)dx+\oint_L(f'_xdx+f'_ydy) .$$

第二部分有一个漂亮的结构：$f'_xdx+f'_ydy$ 正是 $f$ 的**全微分** $df$。全微分沿任何**闭曲线**的积分都是 $0$（势函数在起点终点重合处增量为零），所以这一大块直接消失——题目给"$f$ 有二阶偏导数"就是为了保证 $f'_x,f'_y$ 连续可微，格林公式的条件成立（也可由 $\frac{\partial f'_x}{\partial y}=\frac{\partial f'_y}{\partial x}$ 即混合偏导相等直接判路径无关）。

第一部分用格林公式：$P=-3y$，$Q=0$，
$$\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}=0-(-3)=3 ,$$
逆时针时积分 $=3\times$ 椭圆面积 $=3\times2\pi=6\pi$。题目取**顺时针**，所以再乘 $-1$。

椭圆 $\frac{x^{2}}{4}+y^{2}=1$ 的面积是 $\pi ab=\pi\cdot2\cdot1=2\pi$，这个要记牢。

@解答
把积分拆成两部分：
$$I=\oint_L(-3y)dx+\oint_L(f'_xdx+f'_ydy) .$$

第二部分：因 $f$ 有二阶连续偏导数，$f'_xdx+f'_ydy=df$ 是全微分（等价地 $\dfrac{\partial f'_x}{\partial y}=\dfrac{\partial f'_y}{\partial x}$），沿闭曲线积分为
$$\oint_L df=0 .$$

第一部分：取 $P=-3y$，$Q=0$。若 $L$ 取**逆时针**，由格林公式
$$\oint_{L(\text{逆})}(-3y)dx=\iint_{D}(\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y})dxdy=\iint_{D}3 dxdy=3\cdot S_D ,$$
其中 $D:\dfrac{x^{2}}{4}+y^{2}\leqslant1$ 的面积 $S_D=\pi\cdot2\cdot1=2\pi$，故逆时针时为 $6\pi$。

题设 $L$ 取**顺时针**，故
$$I=-6\pi .$$

@考点
格林公式及其定向要求（逆时针为正）；全微分沿闭曲线积分为零；椭圆面积公式 $\pi ab$；混合偏导相等（$f$ 二阶连续可导）保证 $f'_xdx+f'_ydy$ 是全微分。

易混：格林公式默认边界取正向（逆时针）；遇到顺时针要整体变号。本题两部分中只有第一部分与定向有关（第二部分无论方向都是 $0$）。

@易错
1. 忘记方向，答成 $6\pi$。
2. 椭圆面积算成 $\pi$ 或 $4\pi$。
3. 不拆分，试图对整个被积函数用格林公式（其实也可以：$\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}=f''_{yx}-(-3+f''_{xy})=3$，结果相同，但要用到混合偏导相等）。
4. 误以为 $f$ 未知就无法计算。

[40]
@题目
下列选项中正确的是（　）.
其中一项为：设 $f(x)$ 在 $x=x_{0}$ 处取得极大值，则存在 $x_{0}$ 的邻域 $(x_{0}-\sigma,x_{0}+\sigma)$，使得 $f(x)$ 在 $(x_{0}-\sigma,x_{0})$ 内单调递增，在 $(x_{0},x_{0}+\sigma)$ 内单调递减．（其余选项待核对）

@切入点
这个选项断言"极大值点的左邻域递增、右邻域递减"，听起来非常自然，但它**是错的**——极值是一个"点态"的比较（$f(x_0)\geqslant f(x)$ 对邻域内一切 $x$ 成立），而单调性是"区间上"的性质，两者之间没有蕴含关系。

要否定这种"看起来显然"的命题，标准做法是构造**振荡型反例**：让函数在极值点附近不断上下摆动，但摆动的幅度被一个更高阶的量压住，从而仍然保证 $f(x)<f(x_0)$。最经典的构造模板就是
$$x^{2}(2+\sin\frac1x) \text{或}  x^{2}\sin\frac1x\ \text{之类} .$$
取
$$f(x)=-x^{2}(2+\sin\frac1x)\ (x\neq0),  f(0)=0 ,$$
则因 $2+\sin\frac1x\in[1,3]$，有 $f(x)\leqslant-x^{2}<0=f(0)$（$x\neq0$），$x=0$ 确实是（严格）极大值点；但
$$f'(x)=-2x(2+\sin\frac1x)+\cos\frac1x $$
中 $\cos\frac1x$ 在 $x\to0$ 时反复取遍 $[-1,1]$，而另一项趋于 $0$，故 $f'$ 在 $0$ 的任何邻域内都变号无穷多次，$f$ 不可能单调。

记住这个构造模板：**"$x^{2}\times$ 有界振荡"既能保证极值，又能破坏单调性和导数的符号稳定性**。

@解答
所列命题**错误**。反例：令
$$f(x)=\begin{cases}-x^{2}(2+\sin\dfrac1x),&x\neq0,\\ 0,&x=0 .\end{cases}$$

（1）$x=0$ 是极大值点：因 $1\leqslant2+\sin\dfrac1x\leqslant3$，当 $x\neq0$ 时
$$f(x)\leqslant-x^{2}<0=f(0) ,$$
故 $f$ 在 $x=0$ 处取得（严格）极大值。

（2）$f$ 在 $0$ 的任何邻域内都不单调：当 $x\neq0$ 时
$$f'(x)=-2x(2+\sin\frac1x)+\cos\frac1x .$$
第一项当 $x\to0$ 时趋于 $0$，而 $\cos\dfrac1x$ 在 $x\to0$ 的过程中无穷多次取到 $1$ 与 $-1$。故对任意 $\sigma>0$，$f'$ 在 $(-\sigma,0)$ 与 $(0,\sigma)$ 内都变号无穷多次，$f$ 在其中都不单调。

因此"极大值点左侧必递增、右侧必递减"不成立。

（原始摘录中其余选项缺失，待核对。）

@考点
极值的定义（点态比较）与单调性（区间性质）的区别；用振荡函数构造反例的标准模板 $x^{2}(c+\sin\frac1x)$；导数在一点的符号不能推断邻域内的单调性。

易混：若额外假设 $f$ 在 $x_0$ 的邻域内**可导且 $f'$ 连续**（或 $f'$ 保号），结论就成立；缺了这些条件命题即失效。同类易错命题还有"$f'(x_0)>0\Rightarrow f$ 在 $x_0$ 附近递增"（同样错误）。

@易错
1. 凭直觉认为命题正确。
2. 反例构造得不满足"极大值"（例如用 $x^{2}\sin\frac1x$，它在 $0$ 处既非极大也非极小）。
3. 只说"存在不单调的函数"而不验证它确实取到极大值。

[41]
@题目
设方程组
$$\begin{cases} x_{1} + 2x_{2} + x_{3} = 3, \\ 2x_{1} + (k+4)x_{2} - 5x_{3} = 6, \\ -x_{1} - 2x_{2} + kx_{3} = -3 \end{cases}$$
有无穷多解，则 $k = \underline{\hspace{2cm}}$.

@切入点
"有无穷多解"是对**秩**的要求，所以标准流程是把增广矩阵作初等行变换化成阶梯形，再按
$$\mathrm r(A)=\mathrm r(\overline A)<n$$
来定参数。这里 $n=3$，所以要 $\mathrm r(A)\leqslant2$。

化简时先用第一行消去第一列——注意 $r_3+r_1$ 会把第三行的前两个元素全变成 $0$（因为第三行恰是第一行前两项的相反数），这是本题设计好的便利。化到
$$\begin{pmatrix}1&2&1&3\\0&k&-7&0\\0&0&k+1&0\end{pmatrix}$$
后，系数矩阵的行列式就是 $k(k+1)$，令其为零得 $k=0$ 或 $k=-1$。

但**不能到此为止**：还要对每个候选值回代验证"秩相等且小于 $3$"（即确实相容且解不唯一）。本题两个值都能通过验证，所以答案有两个——只写一个是常见失分点。

@解答
对增广矩阵作初等行变换：
$$\begin{pmatrix}1&2&1&3\\2&k+4&-5&6\\-1&-2&k&-3\end{pmatrix}
\xrightarrow{r_2-2r_1,\ r_3+r_1}
\begin{pmatrix}1&2&1&3\\0&k&-7&0\\0&0&k+1&0\end{pmatrix}.$$
方程组有无穷多解要求 $\mathrm r(A)=\mathrm r(\overline A)<3$，故系数矩阵的行列式
$$\begin{vmatrix}1&2&1\\0&k&-7\\0&0&k+1\end{vmatrix}=k(k+1)=0 ,$$
即 $k=0$ 或 $k=-1$。逐一验证：

$k=0$：矩阵为 $\begin{pmatrix}1&2&1&3\\0&0&-7&0\\0&0&1&0\end{pmatrix}$，$\mathrm r(A)=\mathrm r(\overline A)=2<3$，有无穷多解；

$k=-1$：矩阵为 $\begin{pmatrix}1&2&1&3\\0&-1&-7&0\\0&0&0&0\end{pmatrix}$，$\mathrm r(A)=\mathrm r(\overline A)=2<3$，有无穷多解。

故 $k=0$ 或 $k=-1$。

@考点
线性方程组解的判定：唯一解 $\Leftrightarrow\mathrm r(A)=\mathrm r(\overline A)=n$；无穷多解 $\Leftrightarrow\mathrm r(A)=\mathrm r(\overline A)<n$；无解 $\Leftrightarrow\mathrm r(A)<\mathrm r(\overline A)$。

易混：行列式为零只保证 $\mathrm r(A)<3$，还必须验证**相容**（$\mathrm r(\overline A)=\mathrm r(A)$）才能断定无穷多解；若不相容就是无解。

@易错
1. 只解出 $k(k+1)=0$ 就作答，不回代验证。
2. 漏掉一个根。
3. 行变换算错（注意 $r_2-2r_1$ 后第二个元素是 $k+4-4=k$）。
4. 把"无穷多解"的条件写成 $|A|=0$ 而不检查相容性。

[42]
@题目
求 $x^2 y'' - y'^2 = 0$ 过点 $P(1, 0)$，且在点 $P$ 与 $y = x - 1$ 相切的积分曲线.

@切入点
方程 $x^{2}y''-(y')^{2}=0$ 里**不显含 $y$**（只有 $y'$ 和 $y''$），这是"可降阶方程"的第一种类型：令
$$p=y'\Longrightarrow y''=p' ,$$
方程降为关于 $p$ 的一阶方程 $x^{2}p'=p^{2}$，而且是可分离变量的：
$$\frac{dp}{p^{2}}=\frac{dx}{x^{2}} .$$

"两个定解条件"要分清各自的用途，这是本题第二个要点：
- "过点 $P(1,0)$" $\Rightarrow y(1)=0$；
- "在 $P$ 处与 $y=x-1$ 相切" $\Rightarrow$ 两条曲线在该点有相同的切线斜率，即 $y'(1)=1$。

注意 $y=x-1$ 本身也过 $(1,0)$，所以"相切"提供的新信息只有斜率。求出 $p$ 的通解后**先用 $y'(1)=1$ 定第一个常数**（因为这个条件是关于 $p$ 的），再积分、用 $y(1)=0$ 定第二个常数——顺序反了会很别扭。

@解答
方程不显含 $y$，令 $p=y'$，则 $y''=\dfrac{dp}{dx}$，原方程化为
$$x^{2}\frac{dp}{dx}=p^{2} .$$
分离变量（在 $p\neq0$ 的范围内）：
$$\frac{dp}{p^{2}}=\frac{dx}{x^{2}}\Longrightarrow -\frac1p=-\frac1x+C\Longrightarrow \frac1p=\frac1x-C\Longrightarrow p=\frac{x}{1-Cx} .$$

由"在 $P(1,0)$ 处与直线 $y=x-1$ 相切"得 $y'(1)=1$，即 $p(1)=\dfrac{1}{1-C}=1$，故 $C=0$，于是
$$y'=p=x .$$
积分得 $y=\dfrac{x^{2}}{2}+D$，再由 $y(1)=0$ 得 $D=-\dfrac12$。

所求积分曲线为
$$y=\frac{x^{2}-1}{2} .$$

@考点
可降阶的二阶方程（不显含 $y$ 的类型 $F(x,y',y'')=0$，令 $p=y'$）；可分离变量方程；"相切"条件转化为函数值与导数值两个条件。

易混：另一类可降阶方程是"不显含 $x$"的 $F(y,y',y'')=0$，要令 $p=y'$ 并用 $y''=p\dfrac{dp}{dy}$；两种代换不要混用。

@易错
1. 误用 $y''=p\frac{dp}{dy}$（那是不显含 $x$ 时的做法）。
2. 分离变量后积分符号出错：$\int\frac{dp}{p^{2}}=-\frac1p$。
3. 两个条件的使用顺序颠倒，或把"相切"只理解成"过同一点"。
4. 忽略 $p\equiv0$ 这个特解（本题因 $y'(1)=1\neq0$ 而排除，但应当交代）。

[43]
@题目
设 $A$ 是 3 阶矩阵，$\alpha_{1},\alpha_{2},\alpha_{3}$ 是 3 维列向量，且 $\alpha_{1} \neq 0$，
$$A\alpha_{1} = k\alpha_{1}, \qquad A\alpha_{2} = \alpha_{1} + k\alpha_{2}, \qquad A\alpha_{3} = \alpha_{2} + k\alpha_{3}$$
（Ⅰ）证明：$\alpha_{1},\alpha_{2},\alpha_{3}$ 是 $\mathbf{R}^{3}$ 的一组基；
（Ⅱ）若 $A\alpha_{1}, A\alpha_{2}, A\alpha_{3}$ 线性相关，求 $\mathrm{r}(A)$ 及 $\mathrm{tr}(A)$.

@切入点
（Ⅰ）要证三个向量线性无关，设 $c_1\alpha_1+c_2\alpha_2+c_3\alpha_3=0$ 后，需要"做点什么"来把系数一个个逼出来。手上唯一的工具是三个等式，把它们改写成
$$(A-kE)\alpha_1=0,  (A-kE)\alpha_2=\alpha_1,  (A-kE)\alpha_3=\alpha_2 ,$$
这是一个漂亮的"降级链"：$A-kE$ 作用一次，$\alpha_3\to\alpha_2\to\alpha_1\to0$。于是对等式**反复施加 $A-kE$**，每作用一次就消掉一个系数，最后由 $\alpha_1\neq0$ 依次倒推出 $c_3=c_2=c_1=0$。这种"用算子逐级消元"的手法是若尔当块类问题的通用技巧。

（Ⅱ）三个等式合起来就是矩阵等式
$$AP=PB,  P=(\alpha_1,\alpha_2,\alpha_3),  B=\begin{pmatrix}k&1&0\\0&k&1\\0&0&k\end{pmatrix},$$
（$B$ 的第 $j$ 列给出 $A\alpha_j$ 用 $\alpha_1,\alpha_2,\alpha_3$ 的表示系数）。由（Ⅰ）知 $P$ 可逆，故 $A=PBP^{-1}$，即 **$A$ 与 $B$ 相似**。

"$A\alpha_1,A\alpha_2,A\alpha_3$ 线性相关"即 $AP$ 的列相关，即 $|AP|=0$，而 $|AP|=|A||P|$ 且 $|P|\neq0$，故 $|A|=0$。又 $|A|=|B|=k^{3}$，得 $k=0$。此时 $B$ 是标准的幂零若尔当块，秩和迹一眼可见，再由相似不变量搬给 $A$。

@解答
（Ⅰ）由题设改写为
$$(A-kE)\alpha_1=0,  (A-kE)\alpha_2=\alpha_1,  (A-kE)\alpha_3=\alpha_2 .$$
设
$$c_1\alpha_1+c_2\alpha_2+c_3\alpha_3=0 .$$
两边施加 $A-kE$，得 $c_2\alpha_1+c_3\alpha_2=0$；再施加一次，得 $c_3\alpha_1=0$。因 $\alpha_1\neq0$，故 $c_3=0$；代回得 $c_2\alpha_1=0$，故 $c_2=0$；再代回得 $c_1\alpha_1=0$，故 $c_1=0$。

所以 $\alpha_1,\alpha_2,\alpha_3$ 线性无关，是 $\mathbb R^{3}$ 的一组基。

（Ⅱ）记 $P=(\alpha_1,\alpha_2,\alpha_3)$，则由题设
$$AP=(A\alpha_1,A\alpha_2,A\alpha_3)=(k\alpha_1,\ \alpha_1+k\alpha_2,\ \alpha_2+k\alpha_3)=PB, 
B=\begin{pmatrix}k&1&0\\0&k&1\\0&0&k\end{pmatrix}.$$
由（Ⅰ）$P$ 可逆，故 $A=PBP^{-1}$，$A$ 与 $B$ 相似。

$A\alpha_1,A\alpha_2,A\alpha_3$ 线性相关 $\Longleftrightarrow|AP|=0\Longleftrightarrow|A||P|=0\Longleftrightarrow|A|=0$。而 $|A|=|B|=k^{3}$，故 $k=0$。

此时
$$B=\begin{pmatrix}0&1&0\\0&0&1\\0&0&0\end{pmatrix},  \mathrm r(B)=2,  \mathrm{tr}(B)=0 ,$$
由相似不变性
$$\mathrm r(A)=2,  \mathrm{tr}(A)=0 .$$

@考点
线性无关的定义法证明（用算子逐级消元）；把向量等式组写成矩阵等式 $AP=PB$；相似矩阵的不变量（行列式、秩、迹、特征值）；若尔当块的秩与迹。

易混：$B$ 的列给出的是 $A\alpha_j$ 在基 $\alpha_1,\alpha_2,\alpha_3$ 下的坐标，写 $B$ 时容易转置；核对办法是直接验算 $PB$ 的第 $j$ 列。

@易错
1. （Ⅰ）用行列式或秩去证明（$\alpha_i$ 的分量未知，做不了）。
2. $B$ 写成它的转置。
3. 由 $|A|=0$ 直接说 $\mathrm r(A)=2$——秩还可能是 $1$ 或 $0$，必须通过相似于 $B$ 才能确定。
4. 忘记 $\mathrm{tr}$ 与 $\mathrm r$ 都是相似不变量这一依据。

[44]
@题目
求 $f(x)=(1+x)^{\tan(x-\frac{\pi}{4})}$ 在 $(0,2\pi)$ 内的间断点，并指出其类型.

@切入点
$f(x)=(1+x)^{\tan(x-\frac\pi4)}$ 是幂指函数，间断点只可能来自两处：**底数出问题**或**指数出问题**。这里底数 $1+x$ 在 $(0,2\pi)$ 上始终大于 $1$，光滑且为正，所以全部问题出在指数上。

$\tan u$ 在 $u=\dfrac\pi2+n\pi$ 处无定义，令 $x-\dfrac\pi4=\dfrac\pi2+n\pi$ 得
$$x=\frac{3\pi}{4}+n\pi ,$$
落在 $(0,2\pi)$ 内的是 $x=\dfrac{3\pi}{4}$ 与 $x=\dfrac{7\pi}{4}$。

判断类型时把 $f$ 写成 $\mathrm e^{\tan(x-\frac\pi4)\ln(1+x)}$：在这两点处 $\ln(1+x)$ 是一个**正常数**（因 $1+x>1$），所以指数的极限完全由 $\tan$ 决定：左侧 $\tan\to+\infty$ 故 $f\to+\infty$，右侧 $\tan\to-\infty$ 故 $f\to0$。左极限为无穷 $\Rightarrow$ **第二类（无穷）间断点**。

注意"底数大于 $1$"这一点是判型的关键：若底数小于 $1$，两侧的结论会互换。

@解答
$f(x)=(1+x)^{\tan(x-\frac\pi4)}=\mathrm e^{\tan(x-\frac\pi4)\ln(1+x)}$。在 $(0,2\pi)$ 上底数 $1+x>1$，$\ln(1+x)>0$ 且连续，故间断点只来自 $\tan(x-\dfrac\pi4)$ 无定义之处：
$$x-\frac\pi4=\frac\pi2+n\pi\Longrightarrow x=\frac{3\pi}{4}+n\pi .$$
在 $(0,2\pi)$ 内为
$$x_1=\frac{3\pi}{4},  x_2=\frac{7\pi}{4} .$$

在 $x_1=\dfrac{3\pi}{4}$ 处：$\ln(1+x_1)>0$ 为常数，而
$$x\to x_1^{-}:\ \tan(x-\frac\pi4)\to+\infty\Longrightarrow f\to+\infty; 
x\to x_1^{+}:\ \tan(x-\frac\pi4)\to-\infty\Longrightarrow f\to0 .$$
左极限为 $+\infty$，故 $x_1$ 是**第二类间断点（无穷间断点）**。

在 $x_2=\dfrac{7\pi}{4}$ 处同理（$\ln(1+x_2)>0$）：左极限为 $+\infty$，右极限为 $0$，也是**第二类间断点（无穷间断点）**。

@考点
幂指函数化为 $\mathrm e^{v\ln u}$ 讨论；正切函数的无定义点；间断点的分类（第一类：左右极限都存在；第二类：至少一侧极限不存在或为无穷）。

易混：右极限 $0$ 是存在的有限值，但只要**有一侧**极限不存在（这里左极限为 $+\infty$），就是第二类间断点；不要因为"有一侧极限存在"而误判为第一类。

@易错
1. 把间断点找成 $\tan$ 的零点。
2. 漏掉 $x=\frac{7\pi}{4}$（只找到一个）。
3. 判型时忽略底数 $1+x>1$，把两侧的极限方向弄反。
4. 误认为"右极限存在且有限"就是可去间断点或跳跃间断点。

[45]
@题目
设
$$f(x,y)=\begin{cases}\dfrac{x^{2}+y^{2}}{x^{2}+y^{4}}\sin(xy^{2}), & x^{2}+y^{2}\neq 0,\\ 0, & x^{2}+y^{2}=0,\end{cases}$$
则正确的是（　）.
A. $f''_{xy}(0,0)$ 存在，$f''_{yx}(0,0)$ 存在　　B. $f''_{xy}(0,0)$ 不存在，$f''_{yx}(0,0)$ 存在
C. $f''_{xy}(0,0)$ 存在，$f''_{yx}(0,0)$ 不存在　　D. $f''_{xy}(0,0)$ 不存在，$f''_{yx}(0,0)$ 不存在

@切入点
问的是两个**二阶混合偏导**在原点是否存在。注意 $f''_{xy}=(f'_x)'_y$、$f''_{yx}=(f'_y)'_x$，都是在原点处对"一阶偏导函数"再求偏导，所以必须**先把一阶偏导在整条坐标轴上的表达式求出来**，而不能只求在原点的值。这是本题最关键的认识：

$$f''_{xy}(0,0)=\lim_{y\to0}\frac{f'_x(0,y)-f'_x(0,0)}{y} ,$$
所以需要 $f'_x(0,y)$（在 $y$ 轴上），而不是 $f'_x(0,0)$ 一个数。

计算分三步：
1. 在坐标轴上 $f\equiv0$（因为 $\sin(xy^{2})$ 在 $x=0$ 或 $y=0$ 时为零），故 $f'_x(0,0)=f'_y(0,0)=0$；
2. 求 $f'_x(0,y)$（$y\neq0$）：用定义 $\lim\limits_{x\to0}\frac{f(x,y)}{x}$，用 $\sin(xy^{2})\sim xy^{2}$ 替换，得到 $\dfrac{y^{2}\cdot xy^{2}}{x\cdot y^{4}}=1$——**常数 $1$**，与 $y$ 无关；
3. 求 $f'_y(x,0)$（$x\neq0$）：同样用定义，得 $\lim\limits_{y\to0}\frac{x^{2}\cdot xy^{2}}{y\cdot x^{2}}=\lim xy=0$。

于是 $f'_x(0,y)=1$ 但 $f'_x(0,0)=0$，二者在 $y=0$ 处**跳跃**，差商 $\frac{1-0}{y}\to\infty$，$f''_{xy}(0,0)$ 不存在；而 $f'_y(x,0)\equiv0=f'_y(0,0)$，差商恒为 $0$，$f''_{yx}(0,0)=0$ 存在。

这正是"混合偏导不相等"的经典反例：$f''_{xy}$ 与 $f''_{yx}$ 在混合偏导不连续时可以差别巨大，甚至一个存在一个不存在。

@解答
（1）在坐标轴上，$\sin(xy^{2})=0$，故 $f(x,0)\equiv0$，$f(0,y)\equiv0$，从而
$$f'_x(0,0)=0,  f'_y(0,0)=0 .$$

（2）当 $y\neq0$ 时，由定义
$$f'_x(0,y)=\lim_{x\to0}\frac{f(x,y)-f(0,y)}{x}=\lim_{x\to0}\frac{(x^{2}+y^{2})\sin(xy^{2})}{x(x^{2}+y^{4})} .$$
用 $\sin(xy^{2})\sim xy^{2}$（$x\to0$）：
$$f'_x(0,y)=\lim_{x\to0}\frac{(x^{2}+y^{2})\cdot xy^{2}}{x(x^{2}+y^{4})}=\frac{y^{2}\cdot y^{2}}{y^{4}}=1 .$$
故
$$f''_{xy}(0,0)=\lim_{y\to0}\frac{f'_x(0,y)-f'_x(0,0)}{y}=\lim_{y\to0}\frac{1}{y}=\infty ,$$
即 $f''_{xy}(0,0)$ **不存在**。

（3）当 $x\neq0$ 时，
$$f'_y(x,0)=\lim_{y\to0}\frac{f(x,y)-f(x,0)}{y}=\lim_{y\to0}\frac{(x^{2}+y^{2})\cdot xy^{2}}{y(x^{2}+y^{4})}=\lim_{y\to0}\frac{x^{2}\cdot xy^{2}}{y\cdot x^{2}}=\lim_{y\to0}xy=0 .$$
故
$$f''_{yx}(0,0)=\lim_{x\to0}\frac{f'_y(x,0)-f'_y(0,0)}{x}=\lim_{x\to0}\frac{0}{x}=0 ,$$
**存在**。

选 **B**。

@考点
二阶混合偏导数在一点的定义（对一阶偏导函数再求偏导）；分段函数偏导数必须沿坐标轴用定义计算；混合偏导相等定理（克莱罗定理）要求混合偏导**连续**，否则可以不等甚至不存在。

易混：$f''_{xy}$ 与 $f''_{yx}$ 的求导次序按记号从左到右：$f''_{xy}=(f'_x)'_y$。另外求 $f''_{xy}(0,0)$ 需要 $f'_x$ 在 $y$ 轴上的值，求 $f''_{yx}(0,0)$ 需要 $f'_y$ 在 $x$ 轴上的值，两条轴不要用混。

@易错
1. 只算出 $f'_x(0,0)=f'_y(0,0)=0$ 就断定两个混合偏导都是 $0$。
2. 直接对表达式形式地求导（表达式在原点无定义，求出的结果与原点无关）。
3. 计算 $f'_x(0,y)$ 时用 $\sin u\sim u$ 替换的位置不当（应当在 $x\to0$ 的极限里替换）。
4. 认为混合偏导必然相等。

[46]
@题目
求微分方程
$$y'' + \frac{1}{2}y'^2 = 2y$$
满足 $y(0) = y'(0) = 2$ 的特解.

@切入点
方程 $y''+\dfrac12(y')^{2}=2y$ **不显含 $x$**，这是可降阶方程的第二种类型，标准代换是
$$p=y',  y''=p\frac{dp}{dy} (\text{把 }y\text{ 当自变量}) .$$
代入得
$$p\frac{dp}{dy}+\frac{p^{2}}{2}=2y ,$$
这仍是非线性的（含 $p\frac{dp}{dy}$ 和 $p^{2}$）。但注意到
$$p\frac{dp}{dy}=\frac12\frac{d(p^{2})}{dy} ,$$
所以令 $u=p^{2}$ 就能把它**线性化**：
$$\frac12u'+\frac u2=2y\Longrightarrow u'+u=4y ,$$
一个标准的一阶线性方程。"看到 $p\frac{dp}{dy}$ 与 $p^{2}$ 同时出现就令 $u=p^{2}$"是这类题的关键一招。

解出 $u=4y-4+C\mathrm e^{-y}$ 后用初值 $y=2,p=2$（即 $u=4$）定出 $C=0$——这个 $C=0$ 使后续积分变得极其简单，也提示我们前面没算错。

最后 $p=y'=2\sqrt{y-1}$ 再分离变量积分，用 $y(0)=2$ 定第二个常数。注意开方时取正号，依据是 $y'(0)=2>0$。

@解答
方程不显含 $x$，令 $p=y'$，$y''=p\dfrac{dp}{dy}$，得
$$p\frac{dp}{dy}+\frac{p^{2}}{2}=2y .$$
令 $u=p^{2}$，则 $\dfrac{du}{dy}=2p\dfrac{dp}{dy}$，代入得
$$\frac12\frac{du}{dy}+\frac u2=2y\Longrightarrow \frac{du}{dy}+u=4y .$$
这是一阶线性方程，通解
$$u=4y-4+C\mathrm e^{-y} .$$
由 $y(0)=2$，$y'(0)=2$ 知当 $y=2$ 时 $u=p^{2}=4$：
$$4=8-4+C\mathrm e^{-2}\Longrightarrow C=0 ,$$
故 $u=4(y-1)$，即 $p^{2}=4(y-1)$。因 $y'(0)=2>0$，取
$$y'=2\sqrt{y-1} .$$
分离变量：
$$\frac{dy}{\sqrt{y-1}}=2dx\Longrightarrow 2\sqrt{y-1}=2x+C_1\Longrightarrow \sqrt{y-1}=x+C_2 .$$
由 $y(0)=2$ 得 $C_2=1$，故
$$y=(x+1)^{2}+1 .$$
（验证：$y'=2(x+1)$，$y''=2$，$y''+\frac12(y')^{2}=2+2(x+1)^{2}=2y$，且 $y(0)=y'(0)=2$。）

@考点
可降阶的二阶方程（不显含 $x$：令 $p=y'$，$y''=p\frac{dp}{dy}$）；用 $u=p^{2}$ 把方程线性化；一阶线性方程的通解；由初值确定开方的符号。

易混：不显含 $x$ 用 $y''=p\frac{dp}{dy}$（以 $y$ 为自变量）；不显含 $y$ 用 $y''=\frac{dp}{dx}$（以 $x$ 为自变量）。判断依据是方程里缺哪个变量。

@易错
1. 代换用错类型（写成 $y''=\frac{dp}{dx}$，方程中还留着 $y$，解不下去）。
2. 没想到 $u=p^{2}$，在非线性方程上卡住。
3. 用初值时忘了"$y=2$ 对应 $p=2$"这一对应关系（初值要同时代 $y$ 和 $p$）。
4. 开方取负号，与 $y'(0)=2>0$ 矛盾。

[47]
@题目
设随机变量 $X$ 服从参数为 $\lambda$ 的指数分布，$G(x)$ 是区间 $[0,1]$ 上的均匀分布的分布函数，记 $Y=G(X)$，则（　　）.
A. $Y$ 在区间 $[0,1]$ 上服从均匀分布
B. $Y$ 是连续型随机变量
C. $Y$ 是离散型随机变量
D. $y=1$ 是 $Y$ 的分布函数的间断点

@切入点
关键是**把 $Y=G(X)$ 写成显式的分段表达式**。$G$ 是 $[0,1]$ 上均匀分布的分布函数：
$$G(x)=\begin{cases}0,&x<0,\\ x,&0\leqslant x\leqslant1,\\ 1,&x>1 .\end{cases}$$
而 $X$ 服从指数分布，几乎必然取正值，所以
$$Y=G(X)=\begin{cases}X,&0<X\leqslant1,\\ 1,&X>1 ,\end{cases} \text{即}  Y=\min\{X,1\} .$$

一旦写成 $\min\{X,1\}$，$Y$ 的性质就一目了然：它把 $X$ 在 $1$ 以上的部分**全部压缩到点 $1$**，于是
$$P\{Y=1\}=P\{X\geqslant1\}=\mathrm e^{-\lambda}>0 ,$$
出现了一个**正概率的单点**。这立刻否定 A、B（连续型随机变量任何单点概率为零，更不可能是均匀分布）；而 $Y$ 在 $(0,1)$ 上又是连续取值的（不可列），也不是离散型，否定 C。剩下 D：分布函数在 $y=1$ 处有跳跃（跳跃高度 $\mathrm e^{-\lambda}$），是间断点。

这道题提醒我们：**"概率积分变换 $G(X)$ 服从均匀分布"这条结论要求 $G$ 是 $X$ 自己的分布函数**；这里 $G$ 是别人的分布函数，结论完全不适用。

@解答
$[0,1]$ 上均匀分布的分布函数为
$$G(x)=\begin{cases}0,&x<0,\\ x,&0\leqslant x\leqslant1,\\ 1,&x>1 .\end{cases}$$
$X$ 服从参数 $\lambda$ 的指数分布，$P\{X>0\}=1$，故
$$Y=G(X)=\min\{X,1\} .$$

于是
$$P\{Y=1\}=P\{X\geqslant1\}=\mathrm e^{-\lambda}>0 ,$$
即 $Y$ 在 $y=1$ 处有正概率，故 $Y$ 不是连续型随机变量（B 错），更不服从均匀分布（A 错）；又 $Y$ 在 $(0,1)$ 内取值充满整个区间，不是离散型（C 错）。

$Y$ 的分布函数
$$F_Y(y)=\begin{cases}0,&y<0,\\ 1-\mathrm e^{-\lambda y},&0\leqslant y<1,\\ 1,&y\geqslant1 ,\end{cases}$$
在 $y=1$ 处左极限为 $1-\mathrm e^{-\lambda}$、函数值为 $1$，有跳跃，故 $y=1$ 是 $F_Y$ 的间断点。

选 **D**。

@考点
分布函数的分段表达式；随机变量函数 $Y=g(X)$ 的分布（$g$ 不单调、有"平台"时会产生离散点）；连续型、离散型、混合型随机变量的区别；分布函数的跳跃对应正概率的单点。

易混：概率积分变换定理说的是"若 $F$ 是 $X$ 的分布函数且连续，则 $F(X)\sim U(0,1)$"；本题的 $G$ 并不是 $X$ 的分布函数，所以不能套用。

@易错
1. 误用概率积分变换，选 A。
2. 只看到 $Y$ 取值在 $[0,1]$ 就认为是连续型。
3. 认为存在正概率的点就一定是离散型（本题是混合型）。
4. 分布函数在 $[0,1)$ 上写成 $y$（那是 $X$ 均匀分布时的结论）。

[48]
@题目
设级数 $\sum\limits_{n=0}^{\infty} a_n x^n$ 在 $x = 2$ 处条件收敛，则
$$\sum_{n=0}^{\infty} \frac{a_n}{n+1}(x - 1)^n$$
在 $x = -1$ 处（　　）.
A. 绝对收敛　　B. 条件收敛　　C. 发散　　D. 敛散性不确定

@切入点
这是"由一个幂级数的收敛信息推断另一个幂级数"的题，主线是**先定收敛半径、再看所问的点在不在端点上**：

1. $\sum a_nx^{n}$ 在 $x=2$ 处**条件收敛**，说明 $x=2$ 恰在收敛区间的边界上（内部必绝对收敛，外部必发散），故 $R=2$。
2. 新级数 $\sum\dfrac{a_n}{n+1}(x-1)^{n}$ 的系数只是多除了一个 $n+1$，而 $\sqrt[n]{n+1}\to1$，**收敛半径不变**，仍是 $2$；只是中心移到了 $x=1$，收敛区间为 $(-1,3)$。
3. 所问的 $x=-1$ 恰是**左端点**——端点处的敛散性不能由半径决定，必须具体分析。

端点分析时把问题标准化：记 $b_n=a_n2^{n}$，则 $\sum b_n$ 条件收敛（这是题设的全部信息），而 $x=-1$ 处的通项为
$$\frac{a_n(-2)^{n}}{n+1}=\frac{(-1)^{n}b_n}{n+1} .$$
现在的问题变成：已知 $\sum b_n$ 条件收敛，$\sum\dfrac{(-1)^{n}b_n}{n+1}$ 会怎样？由于 $b_n$ 本身可以带任意的符号模式，$(-1)^{n}$ 可能把交错性**抵消**掉，结果无法确定。构造两个反例即可说明：一个绝对收敛、一个发散。

@解答
（1）由 $\sum a_nx^{n}$ 在 $x=2$ 处条件收敛知 $x=2$ 是收敛区间的端点，故收敛半径 $R=2$。

（2）因 $\sqrt[n]{n+1}\to1$，级数 $\sum\dfrac{a_n}{n+1}t^{n}$ 的收敛半径仍为 $2$，故 $\sum\dfrac{a_n}{n+1}(x-1)^{n}$ 的收敛区间为 $|x-1|<2$，即 $(-1,3)$，而 $x=-1$ 恰为左端点。

（3）记 $b_n=a_n2^{n}$，则 $\sum b_n$ 条件收敛。在 $x=-1$ 处通项为
$$\frac{a_n(-2)^{n}}{n+1}=\frac{(-1)^{n}b_n}{n+1} .$$

反例一：取 $b_n=\dfrac{(-1)^{n}}{n}$（$n\geqslant1$），$\sum b_n$ 条件收敛，而此时通项 $=\dfrac{1}{n(n+1)}$，级数**绝对收敛**。

反例二：取 $b_n=\dfrac{(-1)^{n}}{\ln n}$（$n\geqslant2$），$\sum b_n$ 条件收敛，而此时通项 $=\dfrac{1}{(n+1)\ln n}$，由积分判别法 $\sum\dfrac{1}{n\ln n}$ **发散**。

两种情形都满足题设而结论相反，故敛散性不确定，选 **D**。

@考点
条件收敛点必在收敛区间端点（阿贝尔定理的推论）；系数乘以 $\frac{1}{n+1}$ 不改变收敛半径；端点敛散性需单独判断；$\sum\frac{1}{n\ln n}$ 发散（积分判别法）。

易混：很多人会想"除以 $n+1$ 之后收敛性只会变好"，从而选 A。但这里 $x=-1$ 引入的 $(-1)^{n}$ 可能与 $b_n$ 本身的符号抵消，把交错级数变成正项级数，收敛性反而可能变差。

@易错
1. 只考虑"除以 $n+1$ 使级数更容易收敛"而选 A 或 B。
2. 把新级数的收敛区间中心仍当作 $0$。
3. 认为 $R$ 会因为系数变小而变大。
4. 举不出发散的反例就下结论。

[49]
@题目
设 $\alpha = (2,-1,3)^{\mathrm{T}}$，$\beta = (1,2,0)^{\mathrm{T}}$，$A = \alpha\beta^{\mathrm{T}}$，$E$ 是 3 阶单位矩阵，则 $(A+E)^{n} = \underline{\hspace{2cm}}$.

@切入点
$A=\alpha\beta^{\mathrm T}$ 是**秩 $1$ 矩阵**，这类矩阵的幂有一条黄金法则：
$$A^{2}=\alpha(\beta^{\mathrm T}\alpha)\beta^{\mathrm T}=(\beta^{\mathrm T}\alpha)A ,$$
即 $A^{2}$ 是 $A$ 的 $(\beta^{\mathrm T}\alpha)$ 倍，中间那个 $\beta^{\mathrm T}\alpha$ 是**一个数**。所以做这类题第一件事永远是算 $\beta^{\mathrm T}\alpha$。

这里
$$\beta^{\mathrm T}\alpha=1\cdot2+2\cdot(-1)+0\cdot3=0 ,$$
竟然为零！于是 $A^{2}=O$，$A$ 是幂零矩阵。

有了 $A^{2}=O$，二项式展开（$A$ 与 $E$ 可交换）就只剩两项：
$$(A+E)^{n}=E+nA+C_n^{2}A^{2}+\cdots=E+nA .$$
剩下的只是写出 $A=\alpha\beta^{\mathrm T}$ 这个 $3\times3$ 矩阵。

整道题的难点就在于**先算 $\beta^{\mathrm T}\alpha$ 再决定路线**：若它不为零，$A^{k}=(\beta^{\mathrm T}\alpha)^{k-1}A$，展开式是等比求和，形式完全不同。

@解答
先算
$$\beta^{\mathrm T}\alpha=1\cdot2+2\cdot(-1)+0\cdot3=0 ,$$
故
$$A^{2}=(\alpha\beta^{\mathrm T})(\alpha\beta^{\mathrm T})=\alpha(\beta^{\mathrm T}\alpha)\beta^{\mathrm T}=O ,$$
从而 $A^{k}=O$（$k\geqslant2$）。因 $A$ 与 $E$ 可交换，由二项式定理
$$(A+E)^{n}=E+nA+C_n^{2}A^{2}+\cdots=E+nA .$$
又
$$A=\alpha\beta^{\mathrm T}=\begin{pmatrix}2\\-1\\3\end{pmatrix}(1,2,0)=\begin{pmatrix}2&4&0\\-1&-2&0\\3&6&0\end{pmatrix},$$
故
$$(A+E)^{n}=\begin{pmatrix}1+2n&4n&0\\-n&1-2n&0\\3n&6n&1\end{pmatrix}.$$

@考点
秩 $1$ 矩阵 $\alpha\beta^{\mathrm T}$ 的幂：$A^{k}=(\beta^{\mathrm T}\alpha)^{k-1}A$；幂零矩阵与二项式定理；$\beta^{\mathrm T}\alpha$ 是数、$\alpha\beta^{\mathrm T}$ 是矩阵。

易混：$\beta^{\mathrm T}\alpha$（数，等于 $\mathrm{tr}(\alpha\beta^{\mathrm T})$）与 $\alpha\beta^{\mathrm T}$（矩阵）；本题恰好前者为零，使 $A$ 幂零。

@易错
1. 不先算 $\beta^{\mathrm T}\alpha$，直接硬算 $A^{2}$（虽然也能得到 $O$，但费时）。
2. 二项式展开时忘了 $A$ 与 $E$ 可交换是前提。
3. $\alpha\beta^{\mathrm T}$ 写成 $\beta\alpha^{\mathrm T}$（转置弄反）。
4. 答案漏掉单位矩阵部分，只写 $nA$。

[50]
@题目
直线
$$L_1:\begin{cases}x-1=0,\\ y=z\end{cases}\qquad L_2:\begin{cases}x+2y=0,\\ z+2=0\end{cases}$$
之间的距离 $d=$________.

@切入点
两条直线的距离问题，第一步必须**先判断位置关系**：相交（距离 $0$）、平行（用点到直线距离）、异面（用公垂线公式）。判断的依据是方向向量是否平行、以及两线是否有公共点。

本题两方向向量
$$\mathbf s_1=(0,1,1),  \mathbf s_2=(2,-1,0)$$
不平行；进一步会发现它们不相交（异面）。异面直线的距离公式是
$$d=\frac{|\overrightarrow{P_1P_2}\cdot(\mathbf s_1\times\mathbf s_2)|}{|\mathbf s_1\times\mathbf s_2|} ,$$
其几何意义是：把连接两线上任意两点的向量，投影到**公垂线方向** $\mathbf s_1\times\mathbf s_2$ 上。理解了这个意义就不会把公式记错。

具体操作只有三件事：
1. 从每条直线的方程中读出**一个点**和**方向向量**（本题都是一般式，方向向量可由两个法向量的叉积得到，或直接观察参数化）；
2. 算 $\mathbf s_1\times\mathbf s_2$；
3. 代公式。

@解答
$L_1:\begin{cases}x=1,\\ y=z\end{cases}$ 可参数化为 $(1,t,t)$，故过点 $P_1(1,0,0)$，方向向量 $\mathbf s_1=(0,1,1)$。

$L_2:\begin{cases}x+2y=0,\\ z=-2\end{cases}$ 可参数化为 $(-2t,t,-2)$，故过点 $P_2(0,0,-2)$，方向向量 $\mathbf s_2=(-2,1,0)$（取相反向量 $(2,-1,0)$ 亦可）。

取 $\mathbf s_2=(2,-1,0)$，则
$$\mathbf s_1\times\mathbf s_2=\begin{vmatrix}\mathbf i&\mathbf j&\mathbf k\\0&1&1\\2&-1&0\end{vmatrix}=(1,\ 2,\ -2),  |\mathbf s_1\times\mathbf s_2|=3 .$$
又 $\overrightarrow{P_1P_2}=(-1,0,-2)$，故
$$d=\frac{|\overrightarrow{P_1P_2}\cdot(\mathbf s_1\times\mathbf s_2)|}{|\mathbf s_1\times\mathbf s_2|}=\frac{|(-1)\cdot1+0\cdot2+(-2)\cdot(-2)|}{3}=\frac{3}{3}=1 .$$
（因 $d\neq0$，两直线确为异面直线。）

@考点
由直线的一般式方程读取点与方向向量；向量积求公垂线方向；异面直线间距离公式 $d=\dfrac{|\overrightarrow{P_1P_2}\cdot(\mathbf s_1\times\mathbf s_2)|}{|\mathbf s_1\times\mathbf s_2|}$（即混合积的绝对值除以叉积的模）。

易混：若 $\mathbf s_1\parallel\mathbf s_2$（叉积为零向量），公式失效，此时两直线平行，要用点到直线的距离；若混合积为零则两直线共面（相交或平行）。

@易错
1. 方向向量取错（把两个平面的法向量之一当成方向向量）。
2. 叉积计算出错，或忘记取绝对值。
3. 不检验是否异面就套公式。
4. 分母写成 $|\mathbf s_1||\mathbf s_2|$。

[51]
@题目
设 $L$ 为闭曲线 $|x|+|y|=1$，取逆时针方向，则
$$I=\oint_L \frac{ax\,dy-by\,dx}{|x|+|y|}=(\quad)$$
A. $8(a+b)$　B. $2(a+b)$　C. $8(a-b)$　D. $2(a-b)$

@切入点
被积表达式里有分母 $|x|+|y|$，看起来很麻烦——但**积分路径就是 $|x|+|y|=1$**！在 $L$ 上分母恒等于 $1$，直接消失。"在曲线上用曲线方程化简被积函数"是曲线积分的第一反射，本题把它做成了唯一的考点。

化简后
$$I=\oint_L(ax dy-by dx)=a\oint_Lx dy-b\oint_Ly dx .$$
这两个积分都是"面积型"的标准结论（逆时针时）：
$$\oint_Lx dy=S,  \oint_Ly dx=-S ,$$
它们都可由格林公式一步得到（$\oint x dy=\iint1 dxdy$，$\oint y dx=\iint(-1)dxdy$）。于是
$$I=aS+bS=(a+b)S .$$

最后算面积：$|x|+|y|=1$ 是对角线长为 $2$ 的正方形，$S=\dfrac{1}{2}d_1d_2=\dfrac12\cdot2\cdot2=2$（或边长 $\sqrt2$，$S=2$）。故 $I=2(a+b)$。

@解答
在 $L$ 上 $|x|+|y|=1$，故分母恒为 $1$：
$$I=\oint_L(ax dy-by dx)=a\oint_Lx dy-b\oint_Ly dx .$$
由格林公式（$L$ 取逆时针为正向），记 $S$ 为 $L$ 所围面积：
$$\oint_Lx dy=\iint_{D}1 dxdy=S,  \oint_Ly dx=\iint_{D}(-1)dxdy=-S .$$
故
$$I=aS-b(-S)=(a+b)S .$$
$|x|+|y|=1$ 是两条对角线长均为 $2$ 的正方形，面积
$$S=\frac12\cdot2\cdot2=2 .$$
所以 $I=2(a+b)$，选 **B**。

@考点
利用积分路径的方程化简被积函数；格林公式；两个常用结论 $\oint_Lx dy=S$、$\oint_Ly dx=-S$、$\oint_L(x dy-y dx)=2S$（均对逆时针闭曲线）。

易混：$\oint x dy$ 与 $\oint y dx$ 差一个负号，合起来才是 $2S$；本题因为被积式是 $ax dy-by dx$，两项的贡献是**相加**的。

@易错
1. 忘记在 $L$ 上 $|x|+|y|=1$，被分母吓住而去分四段硬算。
2. 把 $\oint y dx$ 也当成 $S$，答成 $2(a-b)$（选项 D 正是这个陷阱）。
3. 正方形面积算成 $1$ 或 $4$。
4. 忽略方向（顺时针要变号）。

[52]
@题目
设 $D=\{(x,y)\mid (x-1)^{2}+(y-1)^{2}\leqslant 1,\ x^{2}+y^{2}\leqslant 1\}$，计算
$$I=\iint_{D}(2x-y^{2})\mathrm{d}x\mathrm{d}y.$$

@切入点
$D$ 是两个单位圆（圆心 $(0,0)$ 与 $(1,1)$）的公共部分，呈**透镜形**。直接定限积分会很痛苦，所以要尽量用**对称性**把工作量压到最低。

$D$ 有两条对称性，都要用上：
1. 关于直线 $y=x$ 对称（两个圆心都在这条线上），故 $\displaystyle\iint_Dx d\sigma=\iint_Dy d\sigma$，且 $\displaystyle\iint_Dx^{2}d\sigma=\iint_Dy^{2}d\sigma$；
2. 关于直线 $x+y=1$ 对称——这条不太显然但很关键：变换 $T(x,y)=(1-y,1-x)$ 是关于 $x+y=1$ 的反射，它把圆 $x^{2}+y^{2}\leqslant1$ 与圆 $(x-1)^{2}+(y-1)^{2}\leqslant1$ **互换**，因而保持 $D$ 不变（两圆的公共部分不变）。

用第 2 条可以一步算出一次项：
$$\iint_Dx d\sigma=\iint_D(1-y) d\sigma=S-\iint_Dy d\sigma ,$$
再结合第 1 条 $\iint x=\iint y$，得 $\displaystyle\iint_Dx d\sigma=\frac S2$，于是 $\displaystyle\iint_D2x d\sigma=S$，一次项完全不用积分！

二次项用第 1 条化为 $\displaystyle\iint_Dy^{2}=\frac12\iint_D(x^{2}+y^{2})$，后者在极坐标下好算：把 $D$ 沿弦 $x+y=1$ 切成两块弓形，一块用极坐标（以原点为极点）直接积，另一块用 $T$ 变换搬到第一块上去。

面积 $S$：两个弓形之和，每个弓形对应圆心角 $\frac\pi2$，面积 $\frac12(\theta-\sin\theta)=\frac\pi4-\frac12$，故 $S=\dfrac\pi2-1$。

@解答
两圆交点：由 $x^{2}+y^{2}=1$ 与 $(x-1)^{2}+(y-1)^{2}=1$ 相减得 $x+y=1$，代回得交点 $(1,0)$、$(0,1)$。故弦为 $x+y=1$，$D$ 是两块弓形之并：
$$D_1:\ x+y\geqslant1\ \text{且}\ x^{2}+y^{2}\leqslant1,  D_2:\ x+y\leqslant1\ \text{且}\ (x-1)^{2}+(y-1)^{2}\leqslant1 .$$
每块弓形对应圆心角 $\dfrac\pi2$，面积 $\dfrac12(\dfrac\pi2-\sin\dfrac\pi2)=\dfrac\pi4-\dfrac12$，故
$$S=\frac\pi2-1 .$$

**一次项**。变换 $T(x,y)=(1-y,1-x)$ 是关于直线 $x+y=1$ 的反射（$|J|=1$），它交换两个圆，故保持 $D$ 不变。于是
$$\iint_Dx d\sigma=\iint_D(1-y)d\sigma=S-\iint_Dy d\sigma .$$
又 $D$ 关于 $y=x$ 对称，$\displaystyle\iint_Dx d\sigma=\iint_Dy d\sigma$，故
$$\iint_Dx d\sigma=\frac S2,  \iint_D2x d\sigma=S=\frac\pi2-1 .$$

**二次项**。由关于 $y=x$ 的对称性，
$$\iint_Dy^{2}d\sigma=\frac12\iint_D(x^{2}+y^{2})d\sigma .$$
在 $D_1$ 上用极坐标（$\theta\in[0,\frac\pi2]$，$r$ 从弦 $r=\dfrac{1}{\cos\theta+\sin\theta}$ 到 $1$）：
$$\iint_{D_1}(x^{2}+y^{2})d\sigma=\int_{0}^{\frac\pi2}\int_{\frac{1}{\cos\theta+\sin\theta}}^{1}r^{3}drd\theta=\frac14\int_{0}^{\frac\pi2}[1-\frac{1}{(\cos\theta+\sin\theta)^{4}}]d\theta .$$
由 $\cos\theta+\sin\theta=\sqrt2\sin(\theta+\frac\pi4)$ 及 $\displaystyle\int_{\frac\pi4}^{\frac{3\pi}{4}}\csc^{4}u du=\frac83$ 得 $\displaystyle\int_{0}^{\frac\pi2}\frac{d\theta}{(\cos\theta+\sin\theta)^{4}}=\frac14\cdot\frac83=\frac23$，故
$$\iint_{D_1}(x^{2}+y^{2})d\sigma=\frac14(\frac\pi2-\frac23)=\frac\pi8-\frac16 .$$
再用 $T$ 把 $D_2$ 搬到 $D_1$：
$$\iint_{D_2}(x^{2}+y^{2})d\sigma=\iint_{D_1}[(1-v)^{2}+(1-u)^{2}]dudv=2|D_1|-2\iint_{D_1}(u+v)dudv+\iint_{D_1}(u^{2}+v^{2})dudv .$$
其中 $|D_1|=\dfrac\pi4-\dfrac12$，而由极坐标计算 $\displaystyle\iint_{D_1}(u+v)dudv=\frac13$（利用 $\int_0^{\frac\pi2}\frac{\cos\theta+\sin\theta}{(\cos\theta+\sin\theta)^{3}}d\theta=1$）。于是
$$\iint_{D_2}(x^{2}+y^{2})d\sigma=2(\frac\pi4-\frac12)-\frac23+\frac\pi8-\frac16=\frac{5\pi}{8}-\frac{11}{6} .$$
合计
$$\iint_D(x^{2}+y^{2})d\sigma=(\frac\pi8-\frac16)+(\frac{5\pi}{8}-\frac{11}{6})=\frac{3\pi}{4}-2 ,$$
故
$$\iint_Dy^{2}d\sigma=\frac12(\frac{3\pi}{4}-2)=\frac{3\pi}{8}-1 .$$

**合并**：
$$I=\iint_D2x d\sigma-\iint_Dy^{2}d\sigma=(\frac\pi2-1)-(\frac{3\pi}{8}-1)=\frac{\pi}{8} .$$

@考点
两圆公共部分（透镜形区域）的刻画；弓形面积公式 $\frac12r^{2}(\theta-\sin\theta)$；利用区域在反射变换下不变来化简积分（"对称化"技巧）；极坐标下以直线为内边界的积分。

易混：$D$ 关于 $y=x$ 对称给出的是 $x$ 与 $y$ 的互换不变；$D$ 关于 $x+y=1$ 对称给出的是 $(x,y)\to(1-y,1-x)$ 不变。两条对称性提供的信息不同，必须配合使用才能算出一次项。

@易错
1. 只看到 $y=x$ 的对称性，漏掉关于 $x+y=1$ 的对称性，导致一次项只能硬算。
2. 弓形的圆心角取成 $\frac\pi4$ 或 $\pi$。
3. 极坐标中弦的方程写错（应为 $r=\frac{1}{\cos\theta+\sin\theta}$）。
4. 把 $D$ 当成整个圆盘或两圆之并。

[53]
@题目
设实矩阵 $A=\begin{pmatrix}a&a-1\\a-1&a-1\end{pmatrix}$，若对任意的 2 维非零实列向量 $X$，都有 $|X^{\mathrm T}AX|<|X^{\mathrm T}X|$，则 $a$ 的取值范围为（　　）.
A. $(\frac{1}{3},1)$　B. $(-1,1)$　C. $(-1,0]$　D. $(\frac{1}{3},1]$

@切入点
条件 $|X^{\mathrm T}AX|<|X^{\mathrm T}X|$ 中 $X^{\mathrm T}X=|X|^{2}>0$，所以绝对值可以拆开：
$$-X^{\mathrm T}X<X^{\mathrm T}AX<X^{\mathrm T}X (\forall X\neq0) .$$
把两边移项，就变成**两个二次型同时正定**：
$$X^{\mathrm T}(E-A)X>0 \text{且}  X^{\mathrm T}(E+A)X>0 .$$
"绝对值不等式 $\to$ 双边不等式 $\to$ 两个正定条件"是这道题的全部构思。

剩下的是纯计算：用**顺序主子式全大于零**判定两个 $2$ 阶实对称矩阵正定，各得一个关于 $a$ 的不等式，取交集。

$$E-A=\begin{pmatrix}1-a&1-a\\1-a&2-a\end{pmatrix},  E+A=\begin{pmatrix}1+a&a-1\\a-1&a\end{pmatrix} .$$
注意 $E-A$ 的行列式化简后恰好是 $1-a$（两项相消），非常干净；$E+A$ 的行列式是 $3a-1$。

@解答
因 $X^{\mathrm T}X>0$（$X\neq0$），条件 $|X^{\mathrm T}AX|<|X^{\mathrm T}X|$ 等价于
$$-X^{\mathrm T}X<X^{\mathrm T}AX<X^{\mathrm T}X (\forall X\neq0) ,$$
即
$$X^{\mathrm T}(E-A)X>0\ \text{且}\ X^{\mathrm T}(E+A)X>0 (\forall X\neq0) ,$$
也就是 $E-A$ 与 $E+A$ 都正定。

$$E-A=\begin{pmatrix}1-a&-(a-1)\\-(a-1)&1-(a-1)\end{pmatrix}=\begin{pmatrix}1-a&1-a\\1-a&2-a\end{pmatrix},$$
正定要求
$$1-a>0,  (1-a)(2-a)-(1-a)^{2}=(1-a)[(2-a)-(1-a)]=1-a>0 ,$$
即 $a<1$。

$$E+A=\begin{pmatrix}1+a&a-1\\a-1&a\end{pmatrix},$$
正定要求
$$1+a>0,  a(1+a)-(a-1)^{2}=a+a^{2}-a^{2}+2a-1=3a-1>0 ,$$
即 $a>\dfrac13$（此时自动有 $1+a>0$）。

取交集得
$$a\in(\frac13,1) ,$$
选 **A**。

@考点
正定二次型的定义与顺序主子式判别法；把绝对值不等式转化为双边不等式；$X^{\mathrm T}(E\pm A)X$ 的构造。

易混：判别正定要求**所有**顺序主子式大于零（不是只看行列式）；半正定的判别则要看所有主子式（不只是顺序主子式），条件更强。

@易错
1. 只写出一个正定条件（只考虑 $X^{\mathrm T}AX<X^{\mathrm T}X$），漏掉另一侧，得到 $a<1$ 而选 B 或 C。
2. 端点处理错误：$a=1$ 时 $E-A=O$，$X^{\mathrm T}(E-A)X=0$ 不满足严格不等式，故 $a=1$ 不能取（排除 D）。
3. 计算 $E+A$ 的行列式时展开出错。
4. 忘记 $A$ 是实对称矩阵才能用顺序主子式判别法（本题 $A$ 确实对称）。

[54]
@题目
设 $S$ 是 $x^2+y^2=1,\ z=-1,\ z=1$ 所围成的圆柱体的全表面，计算
$$I=\oiint_{S_{外}}\frac{x\,dydz+z^2\,dxdy}{x^2+y^2+z^2}$$

@切入点
$S$ 是闭曲面取外侧，第一反应是高斯公式；但这里分母 $x^{2}+y^{2}+z^{2}$ 在原点为零，而原点在圆柱体**内部**，高斯公式的条件（被积函数在闭区域内有连续偏导）不满足。所以放弃高斯公式，改走**分片直接计算**。

分片时要在每一片上做两件事：用该片的方程化简分母、判断哪些项为零。

- **侧面** $x^{2}+y^{2}=1$：分母变成常数化的 $1+z^{2}$。侧面的单位外法向量是 $(x,y,0)$，第三个分量为零，故 $\cos\gamma=0$，$dxdy$ 项**整片为零**；而 $dydz=\cos\alpha dS=x dS$，于是 $x dydz=x^{2}dS$，用 $x=\cos\theta$、$dS=d\theta dz$ 积分即可。
- **上下底面** $z=\pm1$：法向量是 $(0,0,\pm1)$，$\cos\alpha=0$，故 $x dydz$ 项为零；只剩 $\dfrac{z^{2}}{x^{2}+y^{2}+1}dxdy$，极坐标一步算出。

最妙的是上下底：$z^{2}$ 在两个底面上都等于 $1$，被积函数完全相同，但**取向相反**（上底取上侧为正、下底取下侧为负），所以两者**恰好抵消**。看出这一点能省一半计算。

@解答
因分母的零点（原点）在 $S$ 所围区域内部，不能用高斯公式，分片计算。

**侧面** $\Sigma_1:x^{2}+y^{2}=1$，$-1\leqslant z\leqslant1$，外法向量 $\mathbf n=(x,y,0)$。
- $dxdy$ 项：$\cos\gamma=0$，故 $\displaystyle\iint_{\Sigma_1}\frac{z^{2}}{x^{2}+y^{2}+z^{2}}dxdy=0$。
- $dydz$ 项：$dydz=\cos\alpha dS=x dS$，且分母 $=1+z^{2}$，令 $x=\cos\theta$，$y=\sin\theta$，$dS=d\theta dz$：
$$\iint_{\Sigma_1}\frac{x dydz}{1+z^{2}}=\int_{-1}^{1}\int_{0}^{2\pi}\frac{\cos^{2}\theta}{1+z^{2}}d\theta dz=\pi\int_{-1}^{1}\frac{dz}{1+z^{2}}=\pi\cdot\frac\pi2=\frac{\pi^{2}}{2} .$$

**上底** $\Sigma_2:z=1$，$x^{2}+y^{2}\leqslant1$，取上侧。$\cos\alpha=0$ 故 $dydz$ 项为零；
$$\iint_{\Sigma_2}\frac{1}{x^{2}+y^{2}+1}dxdy=\int_{0}^{2\pi}\int_{0}^{1}\frac{r}{r^{2}+1}drd\theta=2\pi\cdot\frac12\ln2=\pi\ln2 .$$

**下底** $\Sigma_3:z=-1$，取下侧，被积函数与上底相同但定向相反：
$$-\iint_{x^{2}+y^{2}\leqslant1}\frac{1}{x^{2}+y^{2}+1}dxdy=-\pi\ln2 .$$

两底相消，故
$$I=\frac{\pi^{2}}{2}+\pi\ln2-\pi\ln2=\frac{\pi^{2}}{2} .$$

@考点
第二类曲面积分的分片计算；曲面方程化简被积函数；法向量某个分量为零时对应的那一项为零；上下底面因定向相反而抵消；高斯公式的适用前提（被积函数在闭区域内有连续偏导）。

易混：高斯公式失效不代表不能做，分片直接算永远是可行的后备方案；另外"侧面上 $dxdy$ 项为零"是因为柱面在 $xOy$ 面上的投影退化，也可从 $\cos\gamma=0$ 直接看出。

@易错
1. 忽略原点是奇点，直接套高斯公式。
2. 侧面上把 $dydz$ 当成 $dS$ 或漏掉 $\cos\alpha=x$。
3. $\int_0^{2\pi}\cos^{2}\theta d\theta$ 算成 $2\pi$ 或 $0$（正确值 $\pi$）。
4. 下底忘记取负号，得到 $\frac{\pi^{2}}{2}+2\pi\ln2$。

[55]
@题目
曲线 $y=\dfrac{\sqrt{x}}{1+x^{2}}$ 绕 $x$ 轴旋转一周所得的旋转体，将它在 $x=0$ 与 $x=\xi$（$\xi>0$）之间部分的体积记为 $V(\xi)$，且
$$V(a)=\frac{1}{2}\lim_{\xi\to+\infty}V(\xi)$$
则 $a=$ ______.

@切入点
先把 $V(\xi)$ 写出来。绕 $x$ 轴旋转的体积公式
$$V(\xi)=\pi\int_{0}^{\xi}y^{2}dx=\pi\int_{0}^{\xi}\frac{x}{(1+x^{2})^{2}}dx ,$$
注意 $y^{2}=\dfrac{x}{(1+x^{2})^{2}}$——平方把根号消掉了，被积函数变成有理函数，而且分子 $x$ 恰好能凑微分 $x dx=\frac12d(1+x^{2})$。这正是题目设计 $\sqrt x$ 的用意：**旋转体积公式里的平方会把根号吃掉**。

积出来
$$V(\xi)=\frac\pi2\cdot\frac{\xi^{2}}{1+\xi^{2}} ,$$
是一个单调增、有上界的函数，极限 $\dfrac\pi2$（对应把整条曲线转出来的"无穷长喇叭"的体积，是有限的）。

最后解方程 $V(a)=\dfrac12\cdot\dfrac\pi2=\dfrac\pi4$，即 $\dfrac{a^{2}}{1+a^{2}}=\dfrac12$，得 $a=1$（取正根，因 $a>0$）。

@解答
旋转体体积
$$V(\xi)=\pi\int_{0}^{\xi}y^{2}dx=\pi\int_{0}^{\xi}\frac{x}{(1+x^{2})^{2}}dx .$$
凑微分 $x dx=\dfrac12d(1+x^{2})$：
$$V(\xi)=\frac\pi2\int_{0}^{\xi}\frac{d(1+x^{2})}{(1+x^{2})^{2}}=\frac\pi2[-\frac{1}{1+x^{2}}]_{0}^{\xi}=\frac\pi2(1-\frac{1}{1+\xi^{2}})=\frac\pi2\cdot\frac{\xi^{2}}{1+\xi^{2}} .$$
故
$$\lim_{\xi\to+\infty}V(\xi)=\frac\pi2 .$$
由 $V(a)=\dfrac12\cdot\dfrac\pi2=\dfrac\pi4$ 得
$$\frac\pi2\cdot\frac{a^{2}}{1+a^{2}}=\frac\pi4\Longrightarrow \frac{a^{2}}{1+a^{2}}=\frac12\Longrightarrow a^{2}=1 ,$$
又 $a>0$，故 $a=1$。

@考点
绕 $x$ 轴旋转体的体积公式 $V=\pi\int y^{2}dx$；凑微分法积分；反常积分（无穷区间上体积有限）。

易混：绕 $x$ 轴用 $\pi\int y^{2}dx$，绕 $y$ 轴用 $2\pi\int x|y|dx$（柱壳法）或 $\pi\int x^{2}dy$；本题是绕 $x$ 轴。

@易错
1. 忘记平方，把 $y$ 直接代入。
2. 凑微分时漏掉系数 $\frac12$。
3. 求出 $a^{2}=1$ 后取 $a=-1$（题设 $\xi>0$）。
4. 把 $\lim V(\xi)$ 误算成 $+\infty$。

[56]
@题目
计算下列函数的导数：
（Ⅰ）$y=2^{|\sin x|}$；
（Ⅱ）$y=\ln|\tan x+\sec x|$；
（Ⅲ）$y=(1+x^{2})^{\sin x}$；
（Ⅳ）$y=\ln\dfrac{1}{x+\sqrt{x^{2}+1}}$.

@切入点
四个小题各考一种求导技巧，先识别类型再动手：

（Ⅰ）$2^{|\sin x|}$：**指数函数 $+$ 绝对值**。外层 $a^{u}$ 的导数是 $a^{u}\ln a\cdot u'$，内层 $|\sin x|$ 的导数用 $|u|'=\mathrm{sgn}(u)u'$。要注意在 $\sin x=0$（即 $x=k\pi$）处 $|\sin x|$ 不可导，答案要加定义域限制。

（Ⅱ）$\ln|\tan x+\sec x|$：**对数的导数 $=\frac{u'}{u}$**。算完会发现分子 $\sec^{2}x+\sec x\tan x=\sec x(\sec x+\tan x)$ 恰好含有分母这个因子，约掉得 $\sec x$——这是一个应当记住的结论：$(\ln|\sec x+\tan x|)'=\sec x$。

（Ⅲ）$(1+x^{2})^{\sin x}$：**幂指函数**，取对数求导（底和指数都变，两项都要算）。

（Ⅳ）$\ln\dfrac{1}{x+\sqrt{x^{2}+1}}$：先**化简**再求导。$\ln\frac1u=-\ln u$，于是 $y=-\ln(x+\sqrt{x^{2}+1})$，而 $(\ln(x+\sqrt{x^{2}+1}))'=\frac{1}{\sqrt{x^{2}+1}}$（这也是一个常用结论）。不化简直接用商的求导会麻烦好几倍。

总结：求导题的功夫在于"先看清结构、先化简"，而不是急着套公式。

@解答
（Ⅰ）$y=2^{|\sin x|}$。由 $(a^{u})'=a^{u}\ln a\cdot u'$ 与 $(|u|)'=\mathrm{sgn}(u)\cdot u'$，当 $x\neq k\pi$ 时
$$y'=2^{|\sin x|}\ln2\cdot\mathrm{sgn}(\sin x)\cos x .$$
（在 $x=k\pi$ 处 $|\sin x|$ 不可导，$y$ 也不可导。）

（Ⅱ）$y=\ln|\tan x+\sec x|$。
$$y'=\frac{\sec^{2}x+\sec x\tan x}{\tan x+\sec x}=\frac{\sec x(\sec x+\tan x)}{\sec x+\tan x}=\sec x .$$

（Ⅲ）$y=(1+x^{2})^{\sin x}$。取对数：$\ln y=\sin x\ln(1+x^{2})$，两边求导
$$\frac{y'}{y}=\cos x\ln(1+x^{2})+\sin x\cdot\frac{2x}{1+x^{2}} ,$$
故
$$y'=(1+x^{2})^{\sin x}[\cos x\ln(1+x^{2})+\frac{2x\sin x}{1+x^{2}}] .$$

（Ⅳ）$y=\ln\dfrac{1}{x+\sqrt{x^{2}+1}}=-\ln(x+\sqrt{x^{2}+1})$（注意 $x+\sqrt{x^{2}+1}>0$）。由
$$(x+\sqrt{x^{2}+1})'=1+\frac{x}{\sqrt{x^{2}+1}}=\frac{\sqrt{x^{2}+1}+x}{\sqrt{x^{2}+1}} ,$$
得
$$y'=-\frac{1}{x+\sqrt{x^{2}+1}}\cdot\frac{x+\sqrt{x^{2}+1}}{\sqrt{x^{2}+1}}=-\frac{1}{\sqrt{x^{2}+1}} .$$

@考点
复合函数求导（链式法则）；绝对值函数的导数 $|u|'=\mathrm{sgn}(u)u'$ 及不可导点；幂指函数的对数求导法；两个常用结论 $(\ln|\sec x+\tan x|)'=\sec x$、$(\ln(x+\sqrt{x^{2}+1}))'=\frac{1}{\sqrt{x^{2}+1}}$。

易混：$a^{u}$ 的导数带 $\ln a$，$u^{a}$ 的导数带 $a u^{a-1}$，而 $u^{v}$（幂指）必须取对数或写成 $\mathrm e^{v\ln u}$；三者不要混。

@易错
1. （Ⅰ）漏掉 $\mathrm{sgn}(\sin x)$ 或不说明不可导点。
2. （Ⅱ）不约分，留下一个复杂的商（虽不算错但不是最简）。
3. （Ⅲ）只写一项（把底或指数当常数）。
4. （Ⅳ）不先化简，用商的求导法则绕远；或忘记负号。

[57]
@题目
设二维随机变量 $(X,Y)$ 在 $D=\{(x,y)\mid0\leqslant x\leqslant2,0\leqslant y\leqslant1\}$ 上服从均匀分布，令
$$U=\begin{cases}0,&X\leqslant Y,\\1,&X>Y,\end{cases}\qquad V=\begin{cases}0,&X\leqslant2Y,\\1,&X>2Y,\end{cases}$$
求 $(U,V)$ 的联合分布律，并判别 $U$ 与 $V$ 是否相互独立.

@切入点
$U,V$ 都是由"事件是否发生"定义的示性变量，所以 $(U,V)$ 只有四个取值组合，求联合分布律就是算四个概率。全部工作是**在矩形 $D$ 上算几块区域的面积**（均匀分布，概率 $=\frac{\text{面积}}{\text{总面积}}$，总面积为 $2$）。

先做一个能省事的逻辑观察：
$$X\leqslant Y\ \Longrightarrow\ X\leqslant2Y (\text{因 }Y\geqslant0) ,$$
即 $\{U=0\}\subseteq\{V=0\}$。于是
$$P\{U=0,V=1\}=0 ,$$
四个概率里先白得一个。这种"事件包含关系"的观察在示性变量题里非常常用。

剩下三个：
- $P\{U=0,V=0\}=P\{X\leqslant Y\}$：区域是三角形 $\{0\leqslant x\leqslant y\leqslant1\}$，面积 $\frac12$，概率 $\frac14$；
- $P\{U=1,V=0\}=P\{Y<X\leqslant2Y\}=P\{X\leqslant2Y\}-P\{X\leqslant Y\}$；
- $P\{U=1,V=1\}=1-$ 前三者。

最后判独立：只需找**一个**不满足 $P\{U=i,V=j\}=P\{U=i\}P\{V=j\}$ 的格子即可。事实上 $P\{U=0,V=1\}=0$ 而两个边缘概率都不为零，这一格就已经否定独立性（更快）。

@解答
$(X,Y)$ 在 $D=[0,2]\times[0,1]$ 上均匀分布，面积为 $2$，密度为 $\dfrac12$。

因 $Y\geqslant0$，$X\leqslant Y\Rightarrow X\leqslant2Y$，故
$$P\{U=0,V=1\}=P\{X\leqslant Y,\ X>2Y\}=0 .$$

$$P\{U=0,V=0\}=P\{X\leqslant Y\}=\frac{1}{2}\cdot(\text{三角形 }0\leqslant x\leqslant y\leqslant1\text{ 的面积})=\frac12\cdot\frac12=\frac14 .$$

$$P\{X\leqslant2Y\}=\frac12\int_{0}^{2}(1-\frac x2)dx=\frac12\cdot1=\frac12 ,$$
故
$$P\{U=1,V=0\}=P\{X\leqslant2Y\}-P\{X\leqslant Y\}=\frac12-\frac14=\frac14 ,$$
$$P\{U=1,V=1\}=1-0-\frac14-\frac14=\frac12 .$$

联合分布律为
| $U$ 与 $V$ | $V=0$ | $V=1$ |
|---|---|---|
| $U=0$ | $\frac14$ | $0$ |
| $U=1$ | $\frac14$ | $\frac12$ |

边缘分布：$P\{U=0\}=\dfrac14$，$P\{U=1\}=\dfrac34$；$P\{V=0\}=\dfrac12$，$P\{V=1\}=\dfrac12$。因
$$P\{U=0\}P\{V=0\}=\frac14\cdot\frac12=\frac18\neq\frac14=P\{U=0,V=0\} ,$$
故 $U$ 与 $V$ **不相互独立**。

@考点
均匀分布下"概率 $=$ 面积之比"；示性随机变量的联合分布律；事件包含关系带来的零概率格；独立性的判别（所有格子都要满足乘积公式，只需一个反例即可否定）。

易混：$U$ 与 $V$ 都由同一个 $(X,Y)$ 生成，一般高度相关；"不独立"不需要全部格子都不满足乘积公式，有一个不满足就够了。

@易错
1. 忽略 $\{U=0\}\subseteq\{V=0\}$，把 $P\{U=0,V=1\}$ 算成非零。
2. 面积算错（矩形总面积是 $2$ 不是 $1$）。
3. $P\{X\leqslant2Y\}$ 的区域画错（应是 $y\geqslant\frac x2$ 与矩形的交）。
4. 只验证一个格子成立就断定独立。

[58]
@题目
求
$$f(x,y)=\frac{1}{y^{2}}\mathrm{e}^{-\frac{1}{2y^{2}}[(x-a)^{2}+(y-1)^{2}]}\qquad (y\neq 0,\ a\ \text{为常数})$$
的极值.

@切入点
函数
$$f=\frac{1}{y^{2}}\mathrm e^{-\frac{1}{2y^{2}}[(x-a)^{2}+(y-1)^{2}]}$$
是正的，且形状复杂（指数里还含 $y$）。直接求偏导会非常乱。关键的一招是**取对数**：因 $\ln$ 严格递增，$f$ 与 $\ln f$ 的极值点完全相同，而
$$\ln f=-2\ln|y|-\frac{(x-a)^{2}+(y-1)^{2}}{2y^{2}}$$
求导容易得多。"正函数求极值先取对数"是这类含指数的题的标准预处理。

取对数后还有一个结构上的便利：$x$ 只出现在 $-\dfrac{(x-a)^{2}}{2y^{2}}$ 这一项里，对固定的 $y$ 它在 $x=a$ 处取最大值。所以 $x=a$ 可以**直接定下来**（也可由 $\frac{\partial\ln f}{\partial x}=-\frac{x-a}{y^{2}}=0$ 得到），问题降为一元：
$$g(y)=-2\ln|y|-\frac{(y-1)^{2}}{2y^{2}} .$$
把它展开成 $-2\ln|y|-\frac12+\frac1y-\frac{1}{2y^{2}}$ 再求导最省事：
$$g'(y)=-\frac2y-\frac1{y^{2}}+\frac1{y^{3}}=\frac{-(2y^{2}+y-1)}{y^{3}}=\frac{-(2y-1)(y+1)}{y^{3}} .$$
注意定义域是 $y\neq0$，**分成 $y>0$ 与 $y<0$ 两支**分别讨论符号——这是本题最容易漏的地方，两支各有一个极大值点。

@解答
$f>0$，取对数（极值点不变）：
$$\ln f=-2\ln|y|-\frac{(x-a)^{2}+(y-1)^{2}}{2y^{2}} .$$
由
$$\frac{\partial\ln f}{\partial x}=-\frac{x-a}{y^{2}}=0\Longrightarrow x=a ,$$
且对固定的 $y$，$\ln f$ 关于 $x$ 在 $x=a$ 处取最大。代入得
$$g(y)=\ln f(a,y)=-2\ln|y|-\frac{(y-1)^{2}}{2y^{2}}=-2\ln|y|-\frac12+\frac1y-\frac{1}{2y^{2}} ,$$
$$g'(y)=-\frac2y-\frac{1}{y^{2}}+\frac{1}{y^{3}}=\frac{-2y^{2}-y+1}{y^{3}}=\frac{-(2y-1)(y+1)}{y^{3}} .$$

**当 $y>0$**：$y^{3}>0$。$0<y<\dfrac12$ 时 $(2y-1)(y+1)<0$，$g'>0$；$y>\dfrac12$ 时 $g'<0$。故 $y=\dfrac12$ 是极大值点。

**当 $y<0$**：$y^{3}<0$。$y<-1$ 时 $(2y-1)(y+1)>0$，$g'>0$；$-1<y<0$ 时 $(2y-1)(y+1)<0$，$g'<0$。故 $y=-1$ 是极大值点。

因此 $f$ 有两个极大值点 $(a,\dfrac12)$ 与 $(a,-1)$：
$$f(a,\frac12)=\frac{1}{(1/2)^{2}}\mathrm e^{-\frac{(1/2-1)^{2}}{2\cdot(1/2)^{2}}}=4\mathrm e^{-\frac12}, 
f(a,-1)=1\cdot\mathrm e^{-\frac{(-1-1)^{2}}{2}}=\mathrm e^{-2} .$$
二者均为极大值，$f$ 无极小值。

@考点
正函数取对数后求极值（极值点不变）；多元函数极值的必要条件与一元化；分区间讨论导数符号（定义域被 $y=0$ 分成两支）。

易混：$\ln|y|$ 的导数是 $\frac1y$（对 $y>0$ 与 $y<0$ 都成立），不要写成 $\frac{1}{|y|}$。

@易错
1. 不取对数直接求偏导，计算量剧增且容易出错。
2. 只讨论 $y>0$，漏掉 $y=-1$ 这个极大值点。
3. 把驻点方程解成 $2y^{2}+y-1=0$ 后取错根。
4. 求出驻点不判别极大极小。

[59]
@题目
将
$$f(x) = \frac{x}{x^2 - 5x + 6}$$
展开为 $x - 5$ 的幂级数.

@切入点
"展开成 $x-5$ 的幂级数"，套路固定：
1. **部分分式分解**，把分母的二次式拆成两个一次因式的倒数之和（只有一次式的倒数才能直接用几何级数）；
2. 对每一项**凑成 $\dfrac{1}{1-u}$ 的形式**，其中 $u$ 是 $(x-5)$ 的倍数；
3. 分别展开、合并；
4. 取两个收敛条件的**交集**定收敛区间。

第 2 步是操作要点：因为要以 $5$ 为中心，所以把 $x-2$ 写成 $3+(x-5)$、$x-3$ 写成 $2+(x-5)$，再提出常数：
$$\frac{1}{x-2}=\frac{1}{3}\cdot\frac{1}{1+\frac{x-5}{3}},  \frac{1}{x-3}=\frac{1}{2}\cdot\frac{1}{1+\frac{x-5}{2}} .$$
两者的收敛条件分别是 $|x-5|<3$ 与 $|x-5|<2$，交集为 $|x-5|<2$——**取小的那个**，这正是离中心 $5$ 最近的奇点 $x=3$ 决定的。

@解答
先部分分式分解：
$$f(x)=\frac{x}{(x-2)(x-3)}=\frac{A}{x-2}+\frac{B}{x-3} .$$
由 $x=A(x-3)+B(x-2)$，取 $x=2$ 得 $A=-2$，取 $x=3$ 得 $B=3$，故
$$f(x)=-\frac{2}{x-2}+\frac{3}{x-3} .$$

记 $t=x-5$，则 $x-2=3+t$，$x-3=2+t$：
$$-\frac{2}{3+t}=-\frac23\cdot\frac{1}{1+\frac t3}=-\frac23\sum_{n=0}^{\infty}(-1)^{n}\frac{t^{n}}{3^{n}}=\sum_{n=0}^{\infty}(-1)^{n+1}\frac{2}{3^{n+1}}t^{n} (|t|<3),$$
$$\frac{3}{2+t}=\frac32\cdot\frac{1}{1+\frac t2}=\frac32\sum_{n=0}^{\infty}(-1)^{n}\frac{t^{n}}{2^{n}}=\sum_{n=0}^{\infty}(-1)^{n}\frac{3}{2^{n+1}}t^{n} (|t|<2) .$$
相加得
$$f(x)=\sum_{n=0}^{\infty}(-1)^{n}[\frac{3}{2^{n+1}}-\frac{2}{3^{n+1}}](x-5)^{n},  |x-5|<2 .$$

@考点
有理函数的部分分式分解；几何级数 $\frac{1}{1+u}=\sum(-1)^{n}u^{n}$（$|u|<1$）的逆用；在指定点展开时的凑形技巧；两个级数收敛域取交集。

易混：收敛半径由**离展开中心最近的奇点**决定：奇点是 $x=2$ 与 $x=3$，到中心 $5$ 的距离分别是 $3$ 和 $2$，取小者 $2$。这一几何解释可以用来快速验算。

@易错
1. 部分分式的系数算错（$A=-2$，$B=3$）。
2. 凑形时忘记提出常数 $\frac13$、$\frac12$。
3. 收敛域取成 $|x-5|<3$（取了大的那个）。
4. 忘记把 $t$ 换回 $x-5$。

[60]
@题目
设随机变量 $X_1\sim B(1,p)$，$X_2\sim B(2,p)\ (0<p<1)$，且 $X_1$ 与 $X_2$ 相互独立，记 $Z_1=2X_1+X_2$，$Z_2=X_1-X_2$，则（　　）.
A. $Z_1$ 与 $Z_2$ 不相关，$Z_1$ 与 $Z_2$ 相互独立
B. $Z_1$ 与 $Z_2$ 不相关，$Z_1$ 与 $Z_2$ 不相互独立
C. $Z_1$ 与 $Z_2$ 相关，$Z_1$ 与 $Z_2$ 相互独立
D. $Z_1$ 与 $Z_2$ 相关，$Z_1$ 与 $Z_2$ 不相互独立

@切入点
选择题问"相关性"与"独立性"两件事，必须**分别**回答，而且方向不同：

- **判不相关**：算 $\mathrm{Cov}(Z_1,Z_2)$。用双线性性展开，注意 $X_1,X_2$ 独立故 $\mathrm{Cov}(X_1,X_2)=0$，于是
$$\mathrm{Cov}(2X_1+X_2,X_1-X_2)=2DX_1-DX_2 .$$
代入 $DX_1=p(1-p)$、$DX_2=2p(1-p)$，恰好为 $0$——题目选 $B(1,p)$ 与 $B(2,p)$、系数取 $2$ 和 $1$，就是为了让它归零。

- **判独立**：不能因为不相关就说独立（只有二维正态才有这个等价）。这里 $Z_1,Z_2$ 是**离散型**，所以要找一个具体的取值组合验证乘积公式失败。最省事的是取"最极端"的一格：$Z_1=0$ 只能由 $X_1=X_2=0$ 产生，此时 $Z_2$ 必然为 $0$，于是
$$P\{Z_1=0,Z_2=0\}=P\{Z_1=0\}\neq P\{Z_1=0\}P\{Z_2=0\}$$
（因为 $P\{Z_2=0\}<1$）。一步就否定了独立性。

这道题是"不相关但不独立"的标准例子，答案 B。

@解答
$X_1\sim B(1,p)$，$X_2\sim B(2,p)$，相互独立，故
$$DX_1=p(1-p),  DX_2=2p(1-p),  \mathrm{Cov}(X_1,X_2)=0 .$$

**不相关**：
$$\mathrm{Cov}(Z_1,Z_2)=\mathrm{Cov}(2X_1+X_2,\ X_1-X_2)=2DX_1-2\mathrm{Cov}(X_1,X_2)+\mathrm{Cov}(X_2,X_1)-DX_2$$
$$=2p(1-p)-2p(1-p)=0 ,$$
故 $Z_1$ 与 $Z_2$ **不相关**。

**不独立**：$Z_1=2X_1+X_2=0$ 当且仅当 $X_1=0$ 且 $X_2=0$，此时 $Z_2=X_1-X_2=0$。故
$$P\{Z_1=0,Z_2=0\}=P\{X_1=0,X_2=0\}=(1-p)\cdot(1-p)^{2}=(1-p)^{3}=P\{Z_1=0\} .$$
而
$$P\{Z_2=0\}=P\{X_1=X_2\}=(1-p)^{3}+2p^{2}(1-p)<1 (0<p<1) ,$$
故
$$P\{Z_1=0\}P\{Z_2=0\}<P\{Z_1=0\}=P\{Z_1=0,Z_2=0\} ,$$
乘积公式不成立，$Z_1$ 与 $Z_2$ **不相互独立**。

选 **B**。

@考点
协方差的双线性性；二项分布的方差 $np(1-p)$；独立 $\Rightarrow$ 不相关，反之不然；离散型随机变量独立性的验证（对所有取值组合都要满足乘积公式）。

易混：只有**二维正态**分布才有"不相关 $\Leftrightarrow$ 独立"；一般情形下不相关只是"没有线性关系"。本题正是反例。

@易错
1. 由不相关直接推独立，选 A。
2. 展开协方差时漏项或符号错。
3. $DX_2$ 写成 $p(1-p)$（忘了 $n=2$）。
4. 验证独立性时选的格子不方便，计算冗长。

[61]
@题目
设 $A$ 为 $3 \times 4$ 矩阵，$\mathrm{r}(A) = 1$，若向量组 $\alpha_{1} = (1,2,0,2)^{\mathrm{T}}$，$\alpha_{2} = (-1,-1,1,a)^{\mathrm{T}}$，$\alpha_{3} = (1,-1,a,5)^{\mathrm{T}}$，$\alpha_{4} = (2,a,-3,-5)^{\mathrm{T}}$ 与方程组 $Ax = 0$ 的基础解系等价，求 $Ax = 0$ 的通解.

@切入点
先把"等价"这个条件的信息全部榨出来。设 $Ax=0$ 的解空间为 $W$：
- $\mathrm r(A)=1$，$A$ 有 $4$ 列，故 $\dim W=4-1=3$；
- 题设 $\alpha_1,\alpha_2,\alpha_3,\alpha_4$ 与 $W$ 的基础解系**等价**，而等价的向量组秩相同，故
$$\mathrm r(\alpha_1,\alpha_2,\alpha_3,\alpha_4)=3 ,$$
并且它们张成的空间就是 $W$。

于是解题分两步：
1. 由 $\mathrm r=3<4$ 得 $|(\alpha_1,\alpha_2,\alpha_3,\alpha_4)|=0$，解出 $a$；再逐一验证秩确实是 $3$（不是更小）。
2. 对每个合格的 $a$，找出这四个向量的一个**极大线性无关组**，它就是 $Ax=0$ 的基础解系，通解即其线性组合。

注意：题目并没有给出 $A$，也不需要求 $A$——**解空间完全由这四个向量张成**，这正是"等价"二字的力量。

@解答
因 $A$ 为 $3\times4$ 矩阵且 $\mathrm r(A)=1$，$Ax=0$ 的解空间维数为 $4-1=3$。又 $\alpha_1,\alpha_2,\alpha_3,\alpha_4$ 与基础解系等价，故
$$\mathrm r(\alpha_1,\alpha_2,\alpha_3,\alpha_4)=3 ,$$
且它们张成的空间就是解空间。

由 $\mathrm r<4$ 得
$$|(\alpha_1,\alpha_2,\alpha_3,\alpha_4)|=\begin{vmatrix}1&-1&1&2\\2&-1&-1&a\\0&1&a&-3\\2&a&5&-5\end{vmatrix}=-(a-4)(a+3)(a-1)=0 ,$$
故 $a=1$、$a=4$ 或 $a=-3$。逐一作初等行变换验证，三种情形下秩都恰为 $3$，且

- $a=1$ 时，$\alpha_1,\alpha_2,\alpha_3$ 线性无关，构成极大无关组；
- $a=4$ 时，$\alpha_1,\alpha_2,\alpha_3$ 线性无关，构成极大无关组；
- $a=-3$ 时，$\alpha_1,\alpha_2,\alpha_4$ 线性无关，构成极大无关组（此时 $\alpha_3$ 可由前两个表出）。

因极大无关组就是 $Ax=0$ 的基础解系，故通解为：

当 $a=1$ 或 $a=4$ 时
$$x=k_1\alpha_1+k_2\alpha_2+k_3\alpha_3 ;$$
当 $a=-3$ 时
$$x=k_1\alpha_1+k_2\alpha_2+k_3\alpha_4 ,$$
其中 $k_1,k_2,k_3$ 为任意常数。

@考点
齐次方程组解空间的维数 $n-\mathrm r(A)$；向量组等价 $\Rightarrow$ 秩相等且张成同一空间；用行列式为零求参数、再验证秩；极大线性无关组即基础解系。

易混："等价"比"相等"弱、比"秩相等"强：等价要求互相线性表出，因而张成同一个空间；仅秩相等并不能保证张成同一空间。

@易错
1. 只解出行列式为零的 $a$，不验证秩恰为 $3$（若某个 $a$ 使秩降到 $2$，就不符合题意）。
2. 忘记基础解系含 $3$ 个向量，写成 $2$ 个或 $4$ 个。
3. $a=-3$ 时仍取 $\alpha_1,\alpha_2,\alpha_3$（此时它们线性相关）。
4. 试图先求出矩阵 $A$。

[62]
@题目
设 $(X_1,X_2,\cdots,X_n,X_{n+1})$ 为总体 $X \sim N(\mu,\sigma^2)$ 的简单随机样本，记
$$\overline{X} = \frac{1}{n}\sum_{i=1}^{n}X_i, \quad S^2 = \frac{1}{n-1}\sum_{i=1}^{n}(X_i - \overline{X})^2$$
$$Y = \frac{n}{(n+1)\sigma^2}(X_{n+1} - \overline{X})^2, \quad T = \frac{k(X_{n+1} - \overline{X})^2}{S^2}$$
（Ⅰ）求 $EY$ 和 $DY$；
（Ⅱ）若 $T$ 服从 $F$ 分布，求 $k$ 的值。

@切入点
这是正态总体抽样分布的综合题，全部依据是三条基本定理：
$$\overline X\sim N(\mu,\frac{\sigma^{2}}{n}),  \frac{(n-1)S^{2}}{\sigma^{2}}\sim\chi^{2}(n-1),  \overline X\ \text{与}\ S^{2}\ \text{相互独立} .$$

（Ⅰ）要认出 $Y$ 是某个标准正态量的平方。注意 $X_{n+1}$ 是**第 $n+1$ 个样本**，它与 $\overline X$（只由前 $n$ 个构成）相互独立，所以
$$X_{n+1}-\overline X\sim N(0,\ \sigma^{2}+\frac{\sigma^{2}}{n})=N(0,\ \frac{n+1}{n}\sigma^{2}) .$$
把它标准化再平方，正好就是题中的 $Y$，故 $Y\sim\chi^{2}(1)$，于是 $EY=1$、$DY=2$（$\chi^{2}(m)$ 的期望是 $m$、方差是 $2m$）。看出"$Y$ 是标准化后的平方"是本问的全部。

（Ⅱ）要凑 $F$ 分布，就要凑成
$$F=\frac{\chi^{2}(m)/m}{\chi^{2}(n)/n}\ (\text{两个卡方相互独立}) .$$
分子现成：$Y\sim\chi^{2}(1)$，$Y/1=Y$。分母取 $\dfrac{(n-1)S^{2}/\sigma^{2}}{n-1}=\dfrac{S^{2}}{\sigma^{2}}$。两者独立（$S^{2}$ 与 $\overline X,X_{n+1}$ 都独立）。相除时 $\sigma^{2}$ 恰好约掉——这正是 $F$ 分布"不含未知参数"的好处，也是题目能问出 $k$ 的原因。

@解答
（Ⅰ）$X_{n+1}$ 与 $X_1,\cdots,X_n$ 独立，故 $X_{n+1}$ 与 $\overline X$ 独立，且
$$E(X_{n+1}-\overline X)=0,  D(X_{n+1}-\overline X)=\sigma^{2}+\frac{\sigma^{2}}{n}=\frac{n+1}{n}\sigma^{2} ,$$
即 $X_{n+1}-\overline X\sim N(0,\frac{n+1}{n}\sigma^{2})$。于是
$$\frac{X_{n+1}-\overline X}{\sqrt{\frac{n+1}{n}\sigma^{2}}}\sim N(0,1)\Longrightarrow Y=\frac{n(X_{n+1}-\overline X)^{2}}{(n+1)\sigma^{2}}\sim\chi^{2}(1) ,$$
故
$$EY=1,  DY=2 .$$

（Ⅱ）由正态总体抽样分布定理，$\dfrac{(n-1)S^{2}}{\sigma^{2}}\sim\chi^{2}(n-1)$，且 $S^{2}$ 与 $\overline X$、$X_{n+1}$ 均独立，故与 $Y$ 独立。于是
$$\frac{Y/1}{\dfrac{(n-1)S^{2}/\sigma^{2}}{n-1}}=\frac{Y\sigma^{2}}{S^{2}}=\frac{n(X_{n+1}-\overline X)^{2}}{(n+1)S^{2}}\sim F(1,n-1) .$$
与 $T=\dfrac{k(X_{n+1}-\overline X)^{2}}{S^{2}}$ 比较，得
$$k=\frac{n}{n+1} ,$$
此时 $T\sim F(1,n-1)$。

@考点
正态总体的抽样分布：$\overline X$ 的分布、$\frac{(n-1)S^{2}}{\sigma^{2}}\sim\chi^{2}(n-1)$、$\overline X$ 与 $S^{2}$ 独立；$\chi^{2}(m)$ 的期望与方差；$F$ 分布的构造 $F=\frac{\chi^{2}(m)/m}{\chi^{2}(n)/n}$。

易混：$D(X_{n+1}-\overline X)=\sigma^{2}+\frac{\sigma^{2}}{n}$——两个独立量之差的方差是**相加**，不是相减；这是本题第一个坑。

@易错
1. 误以为 $X_{n+1}$ 包含在 $\overline X$ 里，导致方差算成 $\frac{n-1}{n}\sigma^{2}$。
2. $D(X_{n+1}-\overline X)$ 算成 $\sigma^{2}-\frac{\sigma^{2}}{n}$。
3. 构造 $F$ 时忘记除以各自的自由度。
4. 忘记验证分子分母独立。

[63]
@题目
微分方程 $xy' = \sqrt{x^2 + y^2} + y$ 的通解为 ＿＿＿＿.

@切入点
把方程整理成显式：
$$y'=\frac{\sqrt{x^{2}+y^{2}}+y}{x} .$$
右端是 $x,y$ 的**零次齐次函数**（把 $x,y$ 同时乘 $\lambda>0$ 时右端不变），所以这是**齐次方程**，标准代换
$$u=\frac yx,  y=ux,  y'=u+xu' .$$

代入时要注意开方的符号：当 $x>0$ 时
$$\sqrt{x^{2}+y^{2}}=x\sqrt{1+u^{2}} ,$$
（$x<0$ 时要提 $-x$，结论形式相同，一般答题时说明在 $x>0$ 上讨论即可）。于是方程化为
$$u+xu'=\sqrt{1+u^{2}}+u\Longrightarrow xu'=\sqrt{1+u^{2}} ,$$
$u$ 的一次项自动抵消，成为最干净的可分离变量方程。

积分时要用到 $\displaystyle\int\frac{du}{\sqrt{1+u^{2}}}=\ln(u+\sqrt{1+u^{2}})+C$（反双曲正弦），这是必须记住的基本积分。最后回代 $u=\frac yx$ 并整理成不含分式的形式。

@解答
方程可写成
$$y'=\frac{\sqrt{x^{2}+y^{2}}+y}{x} ,$$
是齐次方程。设 $x>0$，令 $u=\dfrac yx$，则 $y=ux$，$y'=u+xu'$，且 $\sqrt{x^{2}+y^{2}}=x\sqrt{1+u^{2}}$，代入得
$$u+xu'=\sqrt{1+u^{2}}+u\Longrightarrow x\frac{du}{dx}=\sqrt{1+u^{2}} .$$
分离变量：
$$\frac{du}{\sqrt{1+u^{2}}}=\frac{dx}{x}\Longrightarrow \ln(u+\sqrt{1+u^{2}})=\ln x+\ln C\Longrightarrow u+\sqrt{1+u^{2}}=Cx .$$
回代 $u=\dfrac yx$：
$$\frac yx+\frac{\sqrt{x^{2}+y^{2}}}{x}=Cx\Longrightarrow y+\sqrt{x^{2}+y^{2}}=Cx^{2} ,$$
即通解为
$$y+\sqrt{x^{2}+y^{2}}=Cx^{2} (C\ \text{为任意正常数}) .$$

@考点
齐次微分方程的识别（$y'=\varphi(\frac yx)$）与代换 $u=\frac yx$；可分离变量方程；基本积分 $\int\frac{du}{\sqrt{1+u^{2}}}=\ln(u+\sqrt{1+u^{2}})+C$。

易混：齐次方程（$y'=\varphi(\frac yx)$）与一阶线性齐次方程（$y'+P(x)y=0$）是两个完全不同的概念，同名不同义。

@易错
1. 提根号时忘了 $x$ 的符号（$x<0$ 时 $\sqrt{x^{2}+y^{2}}=-x\sqrt{1+u^{2}}$）。
2. 把 $\int\frac{du}{\sqrt{1+u^{2}}}$ 错记成 $\arctan u$ 或 $\arcsin u$。
3. 回代后不整理，留下 $\frac yx$ 形式（不算错但不规范）。
4. 常数 $C$ 的正负未说明。

[64]
@题目
已知点 $A(0,0,0)$ 与 $B(0,1,1)$，$\Sigma$ 是由直线段 $\overline{AB}$ 绕 $z$ 轴旋转一周所得的旋转曲面（介于 $z=1$ 与 $z=2$ 之间部分的内侧），$f(x)$ 可导．
（Ⅰ）求曲面 $\Sigma$ 的方程；
（Ⅱ）计算
$$I=\iint_\Sigma \Big[xf\Big(\frac{x}{y}\Big)+x\Big]dydz+\Big[yf\Big(\frac{x}{y}\Big)+y\Big]dzdx+\Big[zf\Big(\frac{x}{y}\Big)+4z\Big]dxdy$$

@切入点
（Ⅰ）求旋转面：线段 $\overline{AB}$ 上的点是 $(0,t,t)$（$0\leqslant t\leqslant1$），在高度 $z=t$ 处它到 $z$ 轴的距离是 $|y|=t=z$。绕 $z$ 轴旋转时**高度不变、到轴距离不变**，所以旋转面上高度为 $z$ 的点到轴距离都是 $z$：
$$\sqrt{x^{2}+y^{2}}=z ,$$
即圆锥面 $z=\sqrt{x^{2}+y^{2}}$，题中取 $1\leqslant z\leqslant2$ 的部分。

（Ⅱ）这一问有两个漂亮的化简，缺一不可：

**第一，含 $f$ 的三项全部为零。** 把它们合起来看是
$$f(\frac xy) (x,y,z)\cdot d\mathbf S ,$$
即"位置向量点乘面元向量"。而圆锥面是由过原点的射线生成的，位置向量 $(x,y,z)$ 落在锥面的切平面内，与法向量垂直。验证：锥面 $F=x^{2}+y^{2}-z^{2}=0$，$\nabla F=(2x,2y,-2z)$，
$$(x,y,z)\cdot(2x,2y,-2z)=2(x^{2}+y^{2}-z^{2})=0 .$$
于是未知函数 $f$ 整体消失——这是题目敢放一个抽象 $f$ 进来的原因。

**第二，剩下的部分补面用高斯公式。** $\Sigma$ 不闭，补上顶面 $z=2$（上侧）与底面 $z=1$（下侧）就围成立体 $V:1\leqslant z\leqslant2,\ \sqrt{x^{2}+y^{2}}\leqslant z$。散度是常数 $6$，体积用切片法算。最后减去两个补面的积分，并注意题目要的是**内侧**，与高斯公式用的外侧差一个负号。

@解答
（Ⅰ）$\overline{AB}$ 上的点为 $(0,t,t)$，$0\leqslant t\leqslant1$，到 $z$ 轴的距离为 $t$，高度为 $t$。绕 $z$ 轴旋转后，高度为 $z$ 的点到轴的距离仍为 $z$，故
$$\Sigma:\ z=\sqrt{x^{2}+y^{2}} (1\leqslant z\leqslant2) .$$

（Ⅱ）含 $f$ 的三项可写成 $f(\frac xy)(x,y,z)\cdot d\mathbf S$。在锥面 $x^{2}+y^{2}-z^{2}=0$ 上，法向量方向为 $(x,y,-z)$，而
$$(x,y,z)\cdot(x,y,-z)=x^{2}+y^{2}-z^{2}=0 ,$$
故这三项的贡献为 $0$。于是
$$I=\iint_{\Sigma}x dydz+y dzdx+4z dxdy (\text{内侧}) .$$

先算**外侧**。补顶面 $\Sigma_1:z=2$（$x^{2}+y^{2}\leqslant4$，取上侧）与底面 $\Sigma_2:z=1$（$x^{2}+y^{2}\leqslant1$，取下侧），则 $\Sigma(\text{外})+\Sigma_1+\Sigma_2$ 构成立体
$$V:\ 1\leqslant z\leqslant2,\ \sqrt{x^{2}+y^{2}}\leqslant z$$
的外侧边界。散度
$$\mathrm{div}(x,y,4z)=1+1+4=6 ,$$
而
$$\iiint_VdV=\int_{1}^{2}\pi z^{2}dz=\frac{7\pi}{3} ,$$
由高斯公式
$$\iint_{\Sigma(\text{外})}+\iint_{\Sigma_1}+\iint_{\Sigma_2}=6\cdot\frac{7\pi}{3}=14\pi .$$
又在 $\Sigma_1,\Sigma_2$ 上 $\cos\alpha=\cos\beta=0$，只剩 $4z dxdy$：
$$\iint_{\Sigma_1}=4\cdot2\cdot\pi\cdot2^{2}=32\pi,  \iint_{\Sigma_2}=-4\cdot1\cdot\pi\cdot1^{2}=-4\pi .$$
故
$$\iint_{\Sigma(\text{外})}=14\pi-32\pi+4\pi=-14\pi ,$$
从而（题目取内侧，方向相反）
$$I=14\pi .$$

@考点
旋转曲面方程的建立（高度不变、到轴距离不变）；圆锥面上位置向量与法向量正交；补面法与高斯公式；曲面侧向对符号的影响。

易混：补面时补的面必须与原曲面拼成**封闭**曲面且整体取外侧；最后要把补面的积分减回去，并按题目要求调整原曲面的侧。

@易错
1. 没发现含 $f$ 的项为零，被抽象函数卡住。
2. 忘记题目取内侧，答成 $-14\pi$。
3. 立体体积算成圆柱或圆锥（应为 $\int_1^2\pi z^{2}dz$）。
4. 底面取下侧时忘记负号。

[65]
@题目
设 $\alpha = (1,2,3)^{\mathrm{T}}$，$\beta = \left(1, \tfrac{1}{2}, \tfrac{1}{3}\right)^{\mathrm{T}}$，$A = \alpha\beta^{\mathrm{T}}$，则 $A^{n} = \underline{\hspace{2cm}}$.

@切入点
又是秩 $1$ 矩阵 $A=\alpha\beta^{\mathrm T}$ 的幂。核心公式只有一条：
$$A^{n}=(\beta^{\mathrm T}\alpha)^{ n-1}A ,$$
其来源是反复使用 $A^{2}=\alpha(\beta^{\mathrm T}\alpha)\beta^{\mathrm T}=(\beta^{\mathrm T}\alpha)A$——中间的 $\beta^{\mathrm T}\alpha$ 是一个**数**，每乘一次就提出一个。

所以第一步永远是算这个数：
$$\beta^{\mathrm T}\alpha=1\cdot1+\frac12\cdot2+\frac13\cdot3=3 .$$
（顺带一提，$\beta^{\mathrm T}\alpha=\mathrm{tr}(\alpha\beta^{\mathrm T})=\mathrm{tr}A$，可以用矩阵的迹来核对。）

它非零（对比本份第 49 题那里为零，$A$ 幂零，结论完全不同），于是
$$A^{n}=3^{ n-1}\alpha\beta^{\mathrm T} .$$
最后把 $\alpha\beta^{\mathrm T}$ 这个 $3\times3$ 矩阵写出来即可。

@解答
先算
$$\beta^{\mathrm T}\alpha=1\cdot1+\frac12\cdot2+\frac13\cdot3=1+1+1=3 .$$
由
$$A^{2}=(\alpha\beta^{\mathrm T})(\alpha\beta^{\mathrm T})=\alpha(\beta^{\mathrm T}\alpha)\beta^{\mathrm T}=3A ,$$
归纳得
$$A^{n}=3^{ n-1}A=3^{ n-1}\alpha\beta^{\mathrm T} .$$
又
$$\alpha\beta^{\mathrm T}=\begin{pmatrix}1\\2\\3\end{pmatrix}(1,\frac12,\frac13)=\begin{pmatrix}1&\frac12&\frac13\\2&1&\frac23\\3&\frac32&1\end{pmatrix},$$
故
$$A^{n}=3^{ n-1}\begin{pmatrix}1&\frac12&\frac13\\2&1&\frac23\\3&\frac32&1\end{pmatrix}.$$

@考点
秩 $1$ 矩阵的幂公式 $A^{n}=(\beta^{\mathrm T}\alpha)^{n-1}\alpha\beta^{\mathrm T}$；$\mathrm{tr}(\alpha\beta^{\mathrm T})=\beta^{\mathrm T}\alpha$；$\alpha\beta^{\mathrm T}$ 的秩为 $1$。

易混：$\beta^{\mathrm T}\alpha$（数）与 $\alpha\beta^{\mathrm T}$（矩阵）；指数是 $n-1$ 而不是 $n$（因为 $A^{1}=A$ 时系数应为 $3^{0}=1$，可用它检验）。

@易错
1. 指数写成 $3^{n}$。
2. 先硬算 $A^{2},A^{3}$ 找规律（可行但费时）。
3. $\alpha\beta^{\mathrm T}$ 与 $\beta\alpha^{\mathrm T}$ 弄反。
4. 把 $\beta^{\mathrm T}\alpha$ 算错（三项都是 $1$，和为 $3$）。

[66]
@题目
已知 10 部手机中有 7 个合格品和 3 个次品，每次任取一个作测试，测试后不放回，直到将 3 个次品都找到为止，则需要测试 7 次的概率为 ______.

@切入点
这类"抽样直到某事件发生"的题，最省力的模型是：把 $10$ 个产品的**测试顺序**看成一个随机排列，等价地，把 $3$ 个次品所占的**位置集合**看成 $\{1,2,\cdots,10\}$ 的一个随机 $3$ 元子集，共 $C_{10}^{3}=120$ 种，每种等可能。这个"只看次品位置"的化归把问题变成纯组合计数，比逐次计算条件概率清晰得多。

在这个模型下，"第 $7$ 次测出第 $3$ 个次品"就是"$3$ 个次品位置的**最大值恰为 $7$**"，即位置 $7$ 被占、另外 $2$ 个次品落在前 $6$ 个位置中：
$$C_{6}^{2}=15\ \text{种},  P=\frac{15}{120}=\frac18 .$$

**另一种读法**：若"找到"允许通过推断（前 $7$ 次全是合格品时，剩下 $3$ 个必为次品，也算第 $7$ 次找齐），则还要加上"$3$ 个次品都落在后 $3$ 个位置"这一种，概率 $\frac{1}{120}$，总计 $\frac{16}{120}=\frac{2}{15}$。两种读法都在教材中出现过，请按原书的措辞选择。

@解答
把 $3$ 个次品在 $10$ 次测试中所占的位置看作 $\{1,2,\cdots,10\}$ 的随机 $3$ 元子集，共 $C_{10}^{3}=120$ 种，每种等可能。

"需要测试 $7$ 次"即第 $7$ 次恰好测出第 $3$ 个次品，也就是次品位置的最大值为 $7$：位置 $7$ 必为次品，另外 $2$ 个次品在前 $6$ 个位置中任取，
$$C_{6}^{2}=15\ \text{种} ,$$
故
$$P=\frac{C_{6}^{2}}{C_{10}^{3}}=\frac{15}{120}=\frac18 .$$

**补充说明**：若把"前 $7$ 次全部测得合格品（于是剩余 $3$ 个必为次品，无需再测）"也算作第 $7$ 次找齐，则需再加上这一情形：次品全在后 $3$ 个位置，只有 $1$ 种，概率 $\dfrac{1}{120}$，总概率为
$$\frac{15+1}{120}=\frac{2}{15} .$$
请按原书对"找到"的界定选取。

@考点
古典概型；"只看关键元素的位置"这一化归技巧；组合数 $C_{n}^{k}$ 的计数；超几何型抽样（不放回）。

易混：不放回抽样中"第 $k$ 次取到次品"的概率与第一次相同（$\frac{3}{10}$），但"第 $k$ 次取到**第 $3$ 个**次品"要用位置最大值的计数。

@易错
1. 用逐次条件概率相乘，漏掉前 $6$ 次中两个次品位置的组合数。
2. 把 $C_6^2$ 写成 $C_7^2$（第 $7$ 位已被占）。
3. 分母用 $10!$ 或 $A_{10}^{3}$（与分子的计数口径不一致）。
4. 忽略题意中"找到"的两种可能解释。

[67]
@题目
设 3 阶实矩阵 $A$ 有三重特征值 1，$f(x) = |xE - A| - |A^{-1}|$，其中 $E$ 是 3 阶单位矩阵，$x \in \mathbf{R}$，则至少存在一点 $x_{0} \in (0,1)$，使得 $y = f(x)$ 在点 $(x_{0}, f(x_{0}))$ 处的切线（　　）.
A. 平行于直线 $y = 1$　B. 垂直于直线 $y = 1$　C. 平行于直线 $y = x$　D. 垂直于直线 $y = x$

@切入点
题目形式复杂（行列式、逆矩阵、切线），但**逐块翻译**之后就变成一道普通的中值定理题：

1. $A$ 有三重特征值 $1$ $\Rightarrow$ 特征多项式 $|xE-A|=(x-1)^{3}$；
2. $|A|=$ 特征值之积 $=1$，故 $|A^{-1}|=\dfrac{1}{|A|}=1$；
3. 于是 $f(x)=(x-1)^{3}-1$，是一个具体的三次多项式。

问题变成："存在 $x_0\in(0,1)$ 使切线满足某性质"。切线的性质由斜率 $f'(x_0)$ 决定，而"存在一点使 $f'$ 等于某个值"正是**拉格朗日中值定理**的标准结论：
$$f'(x_0)=\frac{f(1)-f(0)}{1-0} .$$
算得 $f(1)=-1$、$f(0)=-2$，故 $f'(x_0)=1$。斜率为 $1$ 即与直线 $y=x$ **平行**。

对照选项：A（平行于 $y=1$）要求斜率 $0$；B（垂直于 $y=1$）要求切线竖直；D（垂直于 $y=x$）要求斜率 $-1$。都不是。

@解答
因 $A$ 有三重特征值 $1$，特征多项式为
$$|xE-A|=(x-1)^{3} ,$$
且 $|A|=1\cdot1\cdot1=1$，故 $|A^{-1}|=\dfrac{1}{|A|}=1$。于是
$$f(x)=(x-1)^{3}-1 .$$
计算端点值：
$$f(0)=(-1)^{3}-1=-2,  f(1)=0-1=-1 .$$
$f$ 在 $[0,1]$ 上连续、在 $(0,1)$ 内可导，由拉格朗日中值定理，存在 $x_0\in(0,1)$ 使
$$f'(x_0)=\frac{f(1)-f(0)}{1-0}=\frac{-1-(-2)}{1}=1 .$$
即曲线在 $(x_0,f(x_0))$ 处的切线斜率为 $1$，与直线 $y=x$ 平行。

选 **C**。

@考点
特征多项式与特征值的关系；$|A|=\prod\lambda_i$、$|A^{-1}|=\frac{1}{|A|}$；拉格朗日中值定理；切线斜率与两直线平行（斜率相等）、垂直（斜率之积为 $-1$）的关系。

易混：$|xE-A|$ 是关于 $x$ 的多项式（首项系数为 $1$），而 $|A-xE|=(-1)^{3}|xE-A|$ 差一个符号；本题用的是前者。

@易错
1. 把 $|A^{-1}|$ 算成 $|A|$ 的相反数或写成 $A^{-1}$ 的某个元素。
2. 特征多项式写成 $(x+1)^{3}$。
3. 忘了用中值定理，试图解方程 $f'(x)=1$（$3(x-1)^{2}=1$ 也能解出 $x_0=1-\frac{1}{\sqrt3}\in(0,1)$，结论相同，但中值定理更直接）。
4. 把"平行于 $y=x$"与"垂直于 $y=x$"弄反。

[68]
@题目
设 $\alpha_{1} = (1,0,2,3)^{\mathrm{T}}$，$\alpha_{2} = (1,1,3,5)^{\mathrm{T}}$，$\alpha_{3} = (1,-1,a,1)^{\mathrm{T}}$，$\beta = (1,b,4,7)^{\mathrm{T}}$，问 $a,b$ 为何值时，$\beta$ 不能由 $\alpha_{1},\alpha_{2},\alpha_{3}$ 线性表示；$a,b$ 为何值时，$\beta$ 可由 $\alpha_{1},\alpha_{2},\alpha_{3}$ 线性表示，并写出表达式.

@切入点
"$\beta$ 能否由 $\alpha_1,\alpha_2,\alpha_3$ 线性表示"完全等价于**线性方程组**
$$x_1\alpha_1+x_2\alpha_2+x_3\alpha_3=\beta$$
是否有解。于是把 $(\alpha_1,\alpha_2,\alpha_3\mid\beta)$ 作为增广矩阵作初等行变换，按秩的关系分三种情形讨论：

- $\mathrm r(A)<\mathrm r(\overline A)$：无解，**不能**表示；
- $\mathrm r(A)=\mathrm r(\overline A)=3$：唯一解，表示法唯一；
- $\mathrm r(A)=\mathrm r(\overline A)<3$：无穷多解，表示法不唯一。

行变换后得到阶梯形
$$\begin{pmatrix}1&1&1&1\\0&1&-1&b\\0&0&a-1&2-b\\0&0&0&4-2b\end{pmatrix},$$
最后一行 $(0,0,0,4-2b)$ 是**判别是否有解的关键**：只要 $b\neq2$ 就出现矛盾方程 $0=4-2b\neq0$，直接无解。所以先由最后一行定 $b$，再由第三行（含参数 $a$）分情况——**从最后一行往上看**是处理这类含参问题最顺的次序。

@解答
$\beta$ 能由 $\alpha_1,\alpha_2,\alpha_3$ 线性表示 $\Longleftrightarrow$ 方程组 $x_1\alpha_1+x_2\alpha_2+x_3\alpha_3=\beta$ 有解。对增广矩阵作初等行变换：
$$(\alpha_1,\alpha_2,\alpha_3\mid\beta)=\begin{pmatrix}1&1&1&1\\0&1&-1&b\\2&3&a&4\\3&5&1&7\end{pmatrix}
\longrightarrow\begin{pmatrix}1&1&1&1\\0&1&-1&b\\0&0&a-1&2-b\\0&0&0&4-2b\end{pmatrix}.$$

（1）当 $b\neq2$ 时，最后一行为 $(0,0,0,4-2b)$ 且 $4-2b\neq0$，方程组无解，$\beta$ **不能**由 $\alpha_1,\alpha_2,\alpha_3$ 线性表示。

（2）当 $b=2$，$a\neq1$ 时，$\mathrm r(A)=\mathrm r(\overline A)=3$，有唯一解：由第三行 $x_3=0$，第二行 $x_2=2$，第一行 $x_1=1-2-0=-1$，即
$$\beta=-\alpha_1+2\alpha_2 .$$

（3）当 $b=2$，$a=1$ 时，$\mathrm r(A)=\mathrm r(\overline A)=2<3$，有无穷多解。取 $x_3=t$ 为自由变量，则 $x_2=2+t$，$x_1=1-x_2-x_3=-1-2t$，即
$$\beta=(-1-2t)\alpha_1+(2+t)\alpha_2+t\alpha_3 (t\ \text{为任意常数}) .$$

@考点
线性表示与线性方程组有解的等价性；增广矩阵的初等行变换与秩的比较；含参数方程组的分类讨论；无穷多解时表达式的写法（含自由参数）。

易混：$\beta$ 能被表示 $\Leftrightarrow\mathrm r(\alpha_1,\alpha_2,\alpha_3)=\mathrm r(\alpha_1,\alpha_2,\alpha_3,\beta)$；表示法唯一还要求 $\alpha_1,\alpha_2,\alpha_3$ 线性无关。

@易错
1. 行变换出错，尤其是第三、四行的消元。
2. 讨论时漏掉 $b=2,a=1$ 的无穷多解情形。
3. 唯一解情形只说"能表示"而不写出表达式。
4. 把 $a,b$ 的条件写反（判别有无解的是 $b$，判别唯一性的是 $a$）。
