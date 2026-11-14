package body HP.Math is

   function Sqrt (X : F) return F is
      G : F := 1.0;
   begin
      if X <= 0.0 then
         return 0.0;
      end if;
      if X >= 1.0 then
         while G * G < X loop
            G := G * 2.0;
         end loop;
      else
         while G * G > X loop
            G := G * 0.5;
         end loop;
      end if;
      for I in 1 .. 8 loop
         G := 0.5 * (G + X / G);
      end loop;
      return G;
   end Sqrt;

   function Cbrt (X : F) return F is
      G    : F := 1.0;
      Sign : F := 1.0;
      A    : F := X;
   begin
      if X < 0.0 then
         Sign := -1.0;
         A := -X;
      elsif X = 0.0 then
         return 0.0;
      end if;
      if A >= 1.0 then
         while G * G * G < A loop
            G := G * 2.0;
         end loop;
      else
         while G * G * G > A loop
            G := G * 0.5;
         end loop;
      end if;
      for I in 1 .. 12 loop
         G := (2.0 * G + A / (G * G)) / 3.0;
      end loop;
      return Sign * G;
   end Cbrt;

   function Ln (X : F) return F is
      Y    : F := X;
      E    : Integer := 0;
      Z    : F;
      Z2   : F;
      Term : F;
      Sum  : F := 0.0;
   begin
      if X <= 0.0 then
         return 0.0;
      end if;
      while Y >= 2.0 loop
         Y := Y / 2.0;
         E := E + 1;
      end loop;
      while Y < 1.0 loop
         Y := Y * 2.0;
         E := E - 1;
      end loop;
      --  ln(Y) = 2 (z + z^3/3 + ...) with z = (Y-1)/(Y+1), Y in [1, 2).
      Z := (Y - 1.0) / (Y + 1.0);
      Z2 := Z * Z;
      Term := Z;
      for K in 0 .. 22 loop
         Sum := Sum + Term / F (2 * K + 1);
         Term := Term * Z2;
      end loop;
      return 2.0 * Sum + F (E) * Ln2;
   end Ln;

   procedure Sin_Cos (Theta : F; S, Co : out F) is
      Two_Pi : constant F := 2.0 * Pi;
      Y      : F := Theta;
      Sign_S : F := 1.0;
      Sign_C : F := 1.0;
      Y2     : F;
      Term   : F;
      Sum_S  : F := 0.0;
      Sum_C  : F := 0.0;
   begin
      while Y < 0.0 loop
         Y := Y + Two_Pi;
      end loop;
      while Y >= Two_Pi loop
         Y := Y - Two_Pi;
      end loop;
      if Y > Pi then
         Y := Y - Pi;
         Sign_S := -1.0;
         Sign_C := -1.0;
      end if;
      if Y > Pi / 2.0 then
         Y := Pi - Y;
         Sign_C := -Sign_C;
      end if;
      Y2 := Y * Y;
      Term := Y;
      for K in 0 .. 12 loop
         Sum_S := Sum_S + Term;
         Term := -Term * Y2 / F ((2 * K + 2) * (2 * K + 3));
      end loop;
      Term := 1.0;
      for K in 0 .. 12 loop
         Sum_C := Sum_C + Term;
         Term := -Term * Y2 / F ((2 * K + 1) * (2 * K + 2));
      end loop;
      S := Sign_S * Sum_S;
      Co := Sign_C * Sum_C;
   end Sin_Cos;

   function Sin (Theta : F) return F is
      S, Co : F;
   begin
      Sin_Cos (Theta, S, Co);
      return S;
   end Sin;

   function Cos (Theta : F) return F is
      S, Co : F;
   begin
      Sin_Cos (Theta, S, Co);
      return Co;
   end Cos;

   --  atan for every real X. Four half-angle reductions, then the Taylor
   --  series, which is then accurate well past 1e-12.
   function Atan_Any (X : F) return F is
      T    : F := X;
      Y2   : F;
      Term : F;
      Sum  : F := 0.0;
   begin
      for I in 1 .. 4 loop
         T := T / (1.0 + Sqrt (1.0 + T * T));
      end loop;
      Y2 := T * T;
      Term := T;
      for K in 0 .. 14 loop
         Sum := Sum + Term / F (2 * K + 1);
         Term := -Term * Y2;
      end loop;
      return Sum * 16.0;
   end Atan_Any;

   function Atan2 (Y, X : F) return F is
   begin
      if X > 0.0 then
         return Atan_Any (Y / X);
      elsif X < 0.0 then
         if Y >= 0.0 then
            return Atan_Any (Y / X) + Pi;
         else
            return Atan_Any (Y / X) - Pi;
         end if;
      elsif Y > 0.0 then
         return Pi / 2.0;
      elsif Y < 0.0 then
         return -Pi / 2.0;
      else
         return 0.0;
      end if;
   end Atan2;

   function Arccos (X : F) return F is
      C : constant F := (if X > 1.0 then 1.0 elsif X < -1.0 then -1.0 else X);
   begin
      return Atan2 (Sqrt (1.0 - C * C), C);
   end Arccos;

   function Abs_C (Z : C) return F is (Sqrt (Z.X * Z.X + Z.Y * Z.Y));

   function Div (A, B : C) return C is
      D : constant F := B.X * B.X + B.Y * B.Y;
   begin
      if D = 0.0 then
         return (0.0, 0.0);
      end if;
      return ((A.X * B.X + A.Y * B.Y) / D, (A.Y * B.X - A.X * B.Y) / D);
   end Div;

   function Rot (Z : C; Theta : F) return C is
      S, Co : F;
   begin
      Sin_Cos (Theta, S, Co);
      return (Z.X * Co - Z.Y * S, Z.X * S + Z.Y * Co);
   end Rot;

end HP.Math;
