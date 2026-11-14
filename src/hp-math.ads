--  Small double-precision helpers. The WebAssembly runtime we link is the
--  same tiny one as symmetry-visualizations, so the tour does not call
--  libm; these routines use only arithmetic.
package HP.Math is

   type C is record
      X, Y : F;
   end record;

   function Sqrt (X : F) return F;
   function Cbrt (X : F) return F;
   function Ln (X : F) return F;
   procedure Sin_Cos (Theta : F; S, Co : out F);
   function Sin (Theta : F) return F;
   function Cos (Theta : F) return F;
   function Atan2 (Y, X : F) return F;
   function Arccos (X : F) return F;

   function Abs_C (Z : C) return F;
   function Add (A, B : C) return C is ((A.X + B.X, A.Y + B.Y));
   function Sub (A, B : C) return C is ((A.X - B.X, A.Y - B.Y));
   function Scale (S : F; Z : C) return C is ((S * Z.X, S * Z.Y));
   function Mul (A, B : C) return C is
     ((A.X * B.X - A.Y * B.Y, A.X * B.Y + A.Y * B.X));
   function Div (A, B : C) return C;
   function Conj (Z : C) return C is ((Z.X, -Z.Y));
   function Rot (Z : C; Theta : F) return C;

end HP.Math;
