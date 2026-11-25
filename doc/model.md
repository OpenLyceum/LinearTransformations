# Model — Linear Transformations

The simulation models vectors and linear maps in the plane. The screens share the following modules in `src/common/model/`.

- `LinearAlgebra.ts` stores `Mat2` as the row-major tuple `[a, b, c, d]`. Vectors are column vectors, so AB applies B first. The shared absolute tolerance `EPS = 1e-9` is used for near-zero checks such as a singular determinant or a zero-length direction.
- `Eigen.ts` uses the characteristic discriminant to distinguish two distinct real eigenvalues (`distinct`), a repeated eigenvalue with every direction valid (`scalar`), a repeated eigenvalue with one eigendirection (`defective`), and a complex conjugate pair (`complex`). Distinct real eigenvalues are returned in descending order.
- `Svd.ts` computes A = UΣVᵀ with descending, nonnegative singular values. V is a rotation. For a full-rank reflection, the second column of U carries the orientation reversal. In the animation both outer factors are rotations, so the second stretch is negative whenever det A < 0. Numerical rank uses `EPS × max(1, σ₁)`, and rank below two gives an infinite condition number.
- `RowReduction.ts` records Gauss–Jordan steps on [A | b] without partial pivoting. It uses the first available pivot above the zero tolerance, swaps only when needed, and snaps near-zero results to zero. It classifies the solution as one point, a line, the whole plane, or empty.
- `LeastSquares.ts` projects onto a line through the origin and returns the perpendicular residual. It also fits y = mx + b by the normal equations and measures the sum of squared vertical residuals. A zero direction or a singular fit returns `null`.
- `Presets.ts` supplies named matrices. `MatrixModel.ts` owns the editable entries and exposes the derived matrix to the screens that share the editor.
