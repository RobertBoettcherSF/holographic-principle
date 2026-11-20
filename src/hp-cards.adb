with HP.Math; use HP.Math;

package body HP.Cards is

   Max_Tiles : constant := 96;
   Max_Sides : constant := 7;

   type Verts is array (0 .. Max_Sides - 1) of C;
   type Gallery is array (0 .. Max_Tiles - 1) of Verts;

   Disk_Tiles  : Gallery;
   Disk_N      : Natural := 0;
   Disk_Ready  : Boolean := False;
   Happy_Tiles : Gallery;
   Happy_N     : Natural := 0;
   Happy_Ready : Boolean := False;
   Phase       : F := 0.0;

   type Leg_Kind is (Boundary, Internal);
   type Leg is record
      Kind : Leg_Kind := Boundary;
      Ref  : Natural := 0;
   end record;
   Happy_Legs : array (0 .. Max_Tiles - 1, 0 .. 4) of Leg;
   Happy_Layer : array (0 .. Max_Tiles - 1) of Natural := (others => 0);
   Happy_Boundary : Natural := 0;
   Layer_Total : array (0 .. 3) of Natural := (others => 0);
   Year_Seconds : constant F := 365.25 * 24.0 * 3600.0;
   Mountain_Kg : constant F := 1.0E11;
   Drive_Bits : constant F := 8.0E12;

   procedure Fail (Code : Integer) is
   begin
      Outputs (0) := 0.0;
      Outputs (1) := F (Code);
   end Fail;

   procedure Ok is
   begin
      Outputs (0) := 1.0;
      Outputs (1) := 0.0;
   end Ok;

   function Whole (X : F) return Boolean is
     (abs (X - F (Integer (X))) < 1.0E-6);

   function Clamp_Len (Z : C; Max_R : F) return C is
      R : constant F := Abs_C (Z);
   begin
      if R = 0.0 or else R <= Max_R then
         return Z;
      end if;
      return Scale (Max_R / R, Z);
   end Clamp_Len;

   --  Disk automorphism sending A to 0. Used both as a view and as a
   --  reflection building block (it is an involution).
   function Psi (A, Z : C) return C is
      Den : constant C :=
        (1.0 - (A.X * Z.X + A.Y * Z.Y), -(A.X * Z.Y - A.Y * Z.X));
   begin
      return Div (Sub (A, Z), Den);
   end Psi;

   function Reflect (P, Q, Z : C) return C is
      Th : F;
      W  : C;
      Qp : C;
   begin
      if Abs_C (P) < 1.0E-12 then
         Th := Atan2 (Q.Y, Q.X);
         W := Rot (Z, -Th);
         W.Y := -W.Y;
         return Rot (W, Th);
      end if;
      Qp := Psi (P, Q);
      Th := Atan2 (Qp.Y, Qp.X);
      W := Rot (Psi (P, Z), -Th);
      W.Y := -W.Y;
      return Psi (P, Rot (W, Th));
   end Reflect;

   function Near (A, B : C) return Boolean is
     (abs (A.X - B.X) < 1.0E-5 and then abs (A.Y - B.Y) < 1.0E-5);

   function Same_Tile (A, B : Verts; N : Positive) return Boolean is
      Found : Boolean;
   begin
      for I in 0 .. N - 1 loop
         Found := False;
         for J in 0 .. N - 1 loop
            if Near (A (I), B (J)) then
               Found := True;
               exit;
            end if;
         end loop;
         if not Found then
            return False;
         end if;
      end loop;
      return True;
   end Same_Tile;

   function Circum_Rho (N, K : Positive) return F is
      Cosh_D : F;
      E      : F;
   begin
      Cosh_D :=
        Cos (Pi / F (N)) * Cos (Pi / F (K)) /
        (Sin (Pi / F (N)) * Sin (Pi / F (K)));
      E := Cosh_D + Sqrt (Cosh_D * Cosh_D - 1.0);
      return (E - 1.0) / (E + 1.0);
   end Circum_Rho;

   procedure Build_Tiling
     (N, K, Depth : Positive; Max_R : F; Tiles : in out Gallery; Count : out Natural)
   is
      Rho     : constant F := Circum_Rho (N, K);
      Q_I     : array (0 .. Max_Tiles - 1) of Natural;
      Q_G     : array (0 .. Max_Tiles - 1) of Natural;
      Head    : Natural := 0;
      Tail    : Natural := 0;
      Fresh   : Verts;
      Too_Far : Boolean;
      Seen    : Boolean;
      Idx     : Natural;
      Gen     : Natural;
      S, Co   : F;
   begin
      Count := 0;
      for J in 0 .. N - 1 loop
         Sin_Cos (2.0 * Pi * F (J) / F (N), S, Co);
         Tiles (0) (J) := (Rho * Co, Rho * S);
      end loop;
      Count := 1;
      Q_I (0) := 0;
      Q_G (0) := 0;
      Tail := 1;
      while Head < Tail loop
         Idx := Q_I (Head);
         Gen := Q_G (Head);
         Head := Head + 1;
         if Gen < Depth then
            for E in 0 .. N - 1 loop
               exit when Count >= Max_Tiles;
               for J in 0 .. N - 1 loop
                  Fresh (J) :=
                    Reflect
                      (Tiles (Idx) (E),
                       Tiles (Idx) ((E + 1) mod N),
                       Tiles (Idx) (J));
               end loop;
               Too_Far := False;
               for J in 0 .. N - 1 loop
                  if Abs_C (Fresh (J)) > Max_R then
                     Too_Far := True;
                  end if;
               end loop;
               if not Too_Far then
                  Seen := False;
                  for T in 0 .. Count - 1 loop
                     if Same_Tile (Fresh, Tiles (T), N) then
                        Seen := True;
                        exit;
                     end if;
                  end loop;
                  if not Seen then
                     for J in 0 .. N - 1 loop
                        Tiles (Count) (J) := Fresh (J);
                     end loop;
                     Q_I (Tail) := Count;
                     Q_G (Tail) := Gen + 1;
                     Tail := Tail + 1;
                     Count := Count + 1;
                  end if;
               end if;
            end loop;
         end if;
      end loop;
   end Build_Tiling;

   procedure Ensure_Disk is
   begin
      if not Disk_Ready then
         Build_Tiling (7, 3, 3, 0.992, Disk_Tiles, Disk_N);
         Disk_Ready := True;
      end if;
   end Ensure_Disk;

   function Edge_Same (A1, A2, B1, B2 : C) return Boolean is
     ((Near (A1, B1) and then Near (A2, B2))
      or else (Near (A1, B2) and then Near (A2, B1)));

   procedure Ensure_Happy is
      Bid : Natural := 0;
   begin
      if Happy_Ready then
         return;
      end if;
      --  Three rings of the {5,4} pentagon code: layers 0..3, 61 tensors.
      Build_Tiling (5, 4, 3, 0.999, Happy_Tiles, Happy_N);
      for T in 0 .. Happy_N - 1 loop
         for E in 0 .. 4 loop
            Happy_Legs (T, E) := (Boundary, 0);
         end loop;
         Happy_Layer (T) := 0;
      end loop;
      for T in 0 .. Happy_N - 1 loop
         for E in 0 .. 4 loop
            if Happy_Legs (T, E).Ref = 0 and Happy_Legs (T, E).Kind = Boundary then
               declare
                  A : constant C := Happy_Tiles (T) (E);
                  B : constant C := Happy_Tiles (T) ((E + 1) mod 5);
                  Matched : Boolean := False;
               begin
                  for U in T + 1 .. Happy_N - 1 loop
                     for Fce in 0 .. 4 loop
                        if Edge_Same
                          (A, B,
                           Happy_Tiles (U) (Fce),
                           Happy_Tiles (U) ((Fce + 1) mod 5))
                        then
                           Happy_Legs (T, E) := (Internal, U);
                           Happy_Legs (U, Fce) := (Internal, T);
                           Matched := True;
                           exit;
                        end if;
                     end loop;
                     exit when Matched;
                  end loop;
                  if not Matched then
                     Happy_Legs (T, E) := (Boundary, Bid);
                     Bid := Bid + 1;
                  end if;
               end;
            end if;
         end loop;
      end loop;
      Happy_Boundary := Bid;
      --  Graph distance from the centre is the ring number.
      for T in 0 .. Happy_N - 1 loop
         Happy_Layer (T) := Happy_N;
      end loop;
      declare
         Q : array (0 .. Max_Tiles - 1) of Natural;
         Head : Natural := 0;
         Tail : Natural := 1;
         U : Natural;
      begin
         Happy_Layer (0) := 0;
         Q (0) := 0;
         while Head < Tail loop
            U := Q (Head);
            Head := Head + 1;
            for E in 0 .. 4 loop
               if Happy_Legs (U, E).Kind = Internal
                 and then Happy_Layer (Happy_Legs (U, E).Ref) = Happy_N
               then
                  Happy_Layer (Happy_Legs (U, E).Ref) := Happy_Layer (U) + 1;
                  Q (Tail) := Happy_Legs (U, E).Ref;
                  Tail := Tail + 1;
               end if;
            end loop;
         end loop;
      end;
      Layer_Total := (others => 0);
      for T in 0 .. Happy_N - 1 loop
         if Happy_Layer (T) <= 3 then
            Layer_Total (Happy_Layer (T)) := Layer_Total (Happy_Layer (T)) + 1;
         end if;
      end loop;
      Happy_Ready := True;
   end Ensure_Happy;

   procedure Write_Edge
     (P, Q : C; Slot : in out Natural; Samples : Positive)
   is
      Qp : C;
      Sp : C;
      Back : C;
   begin
      --  Map P to the origin; the geodesic is then the radius toward Q.
      Qp := Psi (P, Q);
      for S in 0 .. Samples - 1 loop
         exit when Slot + 1 >= Geom'Last;
         Sp := Scale (F (S) / F (Samples - 1), Qp);
         Back := Psi (P, Sp);
         Geom (Slot) := Back.X;
         Geom (Slot + 1) := Back.Y;
         Slot := Slot + 2;
      end loop;
   end Write_Edge;

   procedure Splash_Frame (Advance : Boolean) is
      N    : constant := 42;
      Hole : constant F := 0.34;
      S, Co : F;
      Ang, Rad, Tw : F;
   begin
      if Advance then
         Phase := Phase + 0.018;
      end if;
      Geom_I (0) := N;
      Outputs (2) := Hole;
      for I in 0 .. N - 1 loop
         Ang := Phase + F (I) * 2.39996322973;
         Rad := Hole * (0.97 + 0.055 * Sin (Ang * 2.0 + F (I)));
         Sin_Cos (Ang, S, Co);
         Geom (I * 3) := Rad * Co;
         Geom (I * 3 + 1) := Rad * S;
         Tw := 0.35 + 0.65 * (0.5 + 0.5 * Sin (Phase * 2.2 + F (I) * 1.7));
         Geom (I * 3 + 2) := Tw;
      end loop;
      Ok;
   end Splash_Frame;

   procedure Do_Constants is
   begin
      Ok;
      Outputs (2) := G_Newton;
      Outputs (3) := C_Light;
      Outputs (4) := H_Planck;
      Outputs (5) := Hbar;
      Outputs (6) := K_B;
      Outputs (7) := Sqrt (Planck_Length_Sq);
      Outputs (8) := Mass_Sun;
      Outputs (9) := Mass_Earth;
      Outputs (10) := Ln2;
      Outputs (11) := Pi;
      Outputs (12) := Ads_Eps;
      Outputs (13) := Ads_G;
      Outputs (14) := Ads_C;
      Outputs (15) := Ads_Ell;
   end Do_Constants;

   function Radius_Of (Mass : F) return F is
     (2.0 * G_Newton * Mass / (C_Light * C_Light));

   function Mass_Of_Radius (Radius : F) return F is
     (Radius * C_Light * C_Light / (2.0 * G_Newton));

   function S_Over_K (Mass : F) return F is
     (4.0 * Pi * G_Newton * Mass * Mass / (Hbar * C_Light));

   procedure Store_Body (Mass : F; Slot : Natural) is
      R : constant F := Radius_Of (Mass);
   begin
      Outputs (Slot) := Mass;
      Outputs (Slot + 1) := R;
      Outputs (Slot + 2) := 4.0 * Pi * R * R;
      Outputs (Slot + 3) := S_Over_K (Mass);
      Outputs (Slot + 4) := S_Over_K (Mass) / Ln2;
   end Store_Body;

   procedure Do_Black_Hole is
      Mode : constant Integer := Integer (Inputs (0));
      X    : constant F := Inputs (1);
      Mass : F;
   begin
      Clear_Outputs;
      Store_Body (Mass_Sun, 10);
      Store_Body (Mass_Earth, 15);
      if not Finite (X) then
         Fail (Err_Missing);
         return;
      end if;
      case Mode is
         when 0 =>
            Mass := X;
         when 1 =>
            if X <= 0.0 then
               Fail (Err_Positive);
               return;
            end if;
            Mass := Mass_Of_Radius (X);
         when 2 =>
            if X <= 0.0 then
               Fail (Err_Positive);
               return;
            end if;
            --  bits = S/(k ln 2), S/k = 4 pi G M^2 / (hbar c)
            declare
               SK : constant F := X * Ln2;
               M2 : constant F := SK * Hbar * C_Light / (4.0 * Pi * G_Newton);
            begin
               if M2 <= 0.0 then
                  Fail (Err_Positive);
                  return;
               end if;
               Mass := Sqrt (M2);
            end;
         when others =>
            Fail (Err_Range);
            return;
      end case;
      if not Finite (Mass) or else Mass <= 0.0 then
         Fail (Err_Positive);
         return;
      end if;
      if Mass > 1.0E40 or else not Finite (S_Over_K (Mass)) then
         Fail (Err_Range);
         return;
      end if;
      Ok;
      Store_Body (Mass, 2);
      --  Reference bodies sit at 10 and 15; Store_Body(Mass) must not
      --  clobber them, and Ok must be re-applied because Store_Body
      --  does not touch the status slots. References were written first.
      Store_Body (Mass_Sun, 10);
      Store_Body (Mass_Earth, 15);
      Ok;
   end Do_Black_Hole;

   procedure Count_Ball (Radius : Natural; Cubes, Stickers : out Natural) is
      Inside : Boolean;
   begin
      Cubes := 0;
      Stickers := 0;
      for I in -Radius .. Radius loop
         for J in -Radius .. Radius loop
            for K in -Radius .. Radius loop
               if I * I + J * J + K * K <= Radius * Radius then
                  Cubes := Cubes + 1;
                  for Side in 1 .. 6 loop
                     declare
                        I2 : Integer := I;
                        J2 : Integer := J;
                        K2 : Integer := K;
                     begin
                        case Side is
                           when 1 => I2 := I + 1;
                           when 2 => I2 := I - 1;
                           when 3 => J2 := J + 1;
                           when 4 => J2 := J - 1;
                           when 5 => K2 := K + 1;
                           when 6 => K2 := K - 1;
                        end case;
                        Inside := I2 * I2 + J2 * J2 + K2 * K2 <= Radius * Radius;
                        if not Inside then
                           Stickers := Stickers + 1;
                        end if;
                     end;
                  end loop;
               end if;
            end loop;
         end loop;
      end loop;
   end Count_Ball;

   procedure Do_Ball is
      X : constant F := Inputs (0);
      R : Natural;
      Cubes, Stickers, C2, S2, C1, S1 : Natural;
      V, A : F;
   begin
      Clear_Outputs;
      if not Finite (X) then
         Fail (Err_Missing);
         return;
      end if;
      if X < 1.0 then
         Fail (Err_Positive);
         return;
      end if;
      if not Whole (X) then
         Fail (Err_Whole);
         return;
      end if;
      if X > 12.0 then
         Fail (Err_Range);
         return;
      end if;
      R := Natural (Integer (X));
      Count_Ball (R, Cubes, Stickers);
      Count_Ball (R + 1, C1, S1);
      Count_Ball (2 * R, C2, S2);
      V := 4.0 / 3.0 * Pi * F (R) * F (R) * F (R);
      A := 4.0 * Pi * F (R) * F (R);
      Ok;
      Outputs (2) := F (Cubes);
      Outputs (3) := F (Stickers);
      Outputs (4) := F (C1);
      Outputs (5) := F (S1);
      Outputs (6) := F (C2);
      Outputs (7) := F (S2);
      Outputs (8) := F (Cubes) / F (Integer'Max (Stickers, 1));
      Outputs (9) := F (C2) / F (Integer'Max (S2, 1));
      Outputs (10) := V;
      Outputs (11) := A;
      Outputs (12) := Sqrt (A / (4.0 * Pi));
      Outputs (13) := Cbrt (3.0 * V / (4.0 * Pi));
      Geom_I (0) := R;
      Geom_I (1) := 2 * R + 1;
      for I in -R .. R loop
         for J in -R .. R loop
            declare
               Side : constant Integer := 2 * R + 1;
               Idx  : constant Integer :=
                 2 + (I + R) * Side + (J + R);
               Skin : Boolean := False;
            begin
               if I * I + J * J <= R * R then
                  if (I + 1) * (I + 1) + J * J > R * R
                    or else (I - 1) * (I - 1) + J * J > R * R
                    or else I * I + (J + 1) * (J + 1) > R * R
                    or else I * I + (J - 1) * (J - 1) > R * R
                  then
                     Skin := True;
                  end if;
                  Geom_I (Idx) := (if Skin then 2 else 1);
               else
                  Geom_I (Idx) := 0;
               end if;
            end;
         end loop;
      end loop;
   end Do_Ball;

   procedure Do_Disk is
      A    : C;
      Bulk : C;
      Rho  : F;
      Phi  : F;
      Slot : Natural := 0;
      Samples : constant := 5;
   begin
      Clear_Outputs;
      Ensure_Disk;
      A := Clamp_Len ((Inputs (0), Inputs (1)), 0.8);
      Bulk := Clamp_Len ((Inputs (2), Inputs (3)), 0.9);
      Ok;
      Outputs (2) := A.X;
      Outputs (3) := A.Y;
      Outputs (4) := Bulk.X;
      Outputs (5) := Bulk.Y;
      Rho := Abs_C (Bulk);
      Outputs (6) := Rho;
      if Rho < 1.0E-4 then
         Phi := Pi / 2.0;
      else
         Phi := Arccos (2.0 * Rho / (1.0 + Rho * Rho));
      end if;
      Outputs (7) := Atan2 (Bulk.Y, Bulk.X);
      Outputs (8) := Phi;
      Geom_I (0) := Disk_N;
      Geom_I (1) := 7;
      Geom_I (2) := Samples;
      for T in 0 .. Disk_N - 1 loop
         for E in 0 .. 6 loop
            Write_Edge
              (Psi (A, Disk_Tiles (T) (E)),
               Psi (A, Disk_Tiles (T) ((E + 1) mod 7)),
               Slot, Samples);
         end loop;
      end loop;
      Geom_I (3) := Slot;
      --  Waist geodesic of the bulk point, in the screen disk.
      declare
         Arc_At : constant Natural := Slot;
         U      : C;
         D, Rc  : F;
         Centre : C;
         Tb, Step, Ang : F;
         P      : C;
         Guard  : Natural := 0;
      begin
         Geom_I (4) := Arc_At;
         if Rho < 1.0E-4 then
            Geom (Slot) := -0.97;
            Geom (Slot + 1) := 0.0;
            Geom (Slot + 2) := 0.97;
            Geom (Slot + 3) := 0.0;
            Geom_I (5) := 2;
         else
            U := Scale (1.0 / Rho, Bulk);
            D := 0.5 * (Rho + 1.0 / Rho);
            Rc := 0.5 * (1.0 / Rho - Rho);
            Centre := Scale (D, U);
            Tb := Atan2 (Bulk.Y - Centre.Y, Bulk.X - Centre.X);
            Step := 0.02;
            --  Walk one way, then the other, storing the far side first
            --  so the polyline is in order.
            declare
               Forward : array (0 .. 400) of C;
               Back    : array (0 .. 400) of C;
               NF, NB  : Natural := 0;
            begin
               Ang := Tb;
               loop
                  P := (Centre.X + Rc * Cos (Ang), Centre.Y + Rc * Sin (Ang));
                  exit when Abs_C (P) > 0.985 or else NF = Forward'Last;
                  Forward (NF) := P;
                  NF := NF + 1;
                  Ang := Ang + Step;
                  Guard := Guard + 1;
                  exit when Guard > 800;
               end loop;
               Guard := 0;
               Ang := Tb - Step;
               loop
                  P := (Centre.X + Rc * Cos (Ang), Centre.Y + Rc * Sin (Ang));
                  exit when Abs_C (P) > 0.985 or else NB = Back'Last;
                  Back (NB) := P;
                  NB := NB + 1;
                  Ang := Ang - Step;
                  Guard := Guard + 1;
                  exit when Guard > 800;
               end loop;
               for I in reverse 0 .. NB - 1 loop
                  exit when Slot + 1 >= Geom'Last;
                  Geom (Slot) := Back (I).X;
                  Geom (Slot + 1) := Back (I).Y;
                  Slot := Slot + 2;
               end loop;
               for I in 0 .. NF - 1 loop
                  exit when Slot + 1 >= Geom'Last;
                  Geom (Slot) := Forward (I).X;
                  Geom (Slot + 1) := Forward (I).Y;
                  Slot := Slot + 2;
               end loop;
               Geom_I (5) := (Slot - Arc_At) / 2;
            end;
         end if;
      end;
   end Do_Disk;

   procedure Do_Geodesic is
      A1 : constant F := Inputs (0);
      A2 : constant F := Inputs (1);
      Diff, Abs_D, L, Cut, Length, S_Rt, S_Cft : F;
      Slot : Natural := 0;
   begin
      Clear_Outputs;
      Geom_I (0) := 0;
      if not Finite (A1) or else not Finite (A2) then
         Fail (Err_Missing);
         return;
      end if;
      Diff := A2 - A1;
      while Diff > Pi loop
         Diff := Diff - 2.0 * Pi;
      end loop;
      while Diff < -Pi loop
         Diff := Diff + 2.0 * Pi;
      end loop;
      Abs_D := abs Diff;
      if Abs_D < 0.05 then
         Fail (Err_Close);
         return;
      end if;
      L := 2.0 * Sin (Abs_D / 2.0);
      if L <= Ads_Eps * 2.0 then
         Fail (Err_Close);
         return;
      end if;
      declare
         Ratio : constant F := Ads_Eps / (L / 2.0);
      begin
         Cut := Atan2 (Ratio, Sqrt (1.0 - Ratio * Ratio));
      end;
      Length := -2.0 * Ads_Ell * Ln (Sin (Cut / 2.0) / Cos (Cut / 2.0));
      S_Rt := Length / (4.0 * Ads_G);
      S_Cft := (Ads_C / 3.0) * Ln (L / Ads_Eps);
      Ok;
      Outputs (2) := Abs_D;
      Outputs (3) := L;
      Outputs (4) := Ads_Eps;
      Outputs (5) := Length;
      Outputs (6) := S_Rt;
      Outputs (7) := S_Cft;
      Outputs (8) := Ads_G;
      Outputs (9) := Ads_C;
      Outputs (10) := Ads_Ell;
      Outputs (11) := (Ads_C / 3.0) * Ln (2.0 * L / Ads_Eps);
      Outputs (12) := (Ads_C / 3.0) * Ln2;
      --  Polyline of the shorter geodesic, stopped before the rim.
      declare
         U      : constant C := (Cos (A1), Sin (A1));
         V      : constant C := (Cos (A2), Sin (A2));
         Det    : constant F := U.X * V.Y - U.Y * V.X;
         Centre : C;
         Rc     : F;
         Mid    : C;
         Tb, Ang, Step : F;
         P      : C;
         Forward, Back : array (0 .. 400) of C;
         NF, NB, Guard : Natural := 0;
      begin
         if abs Det < 1.0E-3 then
            Geom (0) := 0.97 * U.X;
            Geom (1) := 0.97 * U.Y;
            Geom (2) := 0.97 * V.X;
            Geom (3) := 0.97 * V.Y;
            Geom_I (0) := 2;
         else
            Centre := ((V.Y - U.Y) / Det, (U.X - V.X) / Det);
            Rc := Sqrt (Centre.X * Centre.X + Centre.Y * Centre.Y - 1.0);
            Mid := Scale (1.0 - Rc / Abs_C (Centre), Centre);
            Tb := Atan2 (Mid.Y - Centre.Y, Mid.X - Centre.X);
            Step := 0.015;
            Ang := Tb;
            loop
               P := (Centre.X + Rc * Cos (Ang), Centre.Y + Rc * Sin (Ang));
               exit when Abs_C (P) > 0.975 or else NF = Forward'Last;
               Forward (NF) := P;
               NF := NF + 1;
               Ang := Ang + Step;
               Guard := Guard + 1;
               exit when Guard > 900;
            end loop;
            Guard := 0;
            Ang := Tb - Step;
            loop
               P := (Centre.X + Rc * Cos (Ang), Centre.Y + Rc * Sin (Ang));
               exit when Abs_C (P) > 0.975 or else NB = Back'Last;
               Back (NB) := P;
               NB := NB + 1;
               Ang := Ang - Step;
               Guard := Guard + 1;
               exit when Guard > 900;
            end loop;
            for I in reverse 0 .. NB - 1 loop
               Geom (Slot) := Back (I).X;
               Geom (Slot + 1) := Back (I).Y;
               Slot := Slot + 2;
            end loop;
            for I in 0 .. NF - 1 loop
               Geom (Slot) := Forward (I).X;
               Geom (Slot + 1) := Forward (I).Y;
               Slot := Slot + 2;
            end loop;
            Geom_I (0) := Slot / 2;
         end if;
      end;
   end Do_Geodesic;

   procedure Do_Happy is
      Erased : array (0 .. 255) of Boolean := (others => False);
      Known  : array (0 .. Max_Tiles - 1) of Boolean := (others => False);
      Changed : Boolean;
      Known_Legs, Read_Count, Erased_Count : Natural;
      Slot : Natural := 0;
      Samples : constant := 4;
      Pattern : Integer;
      L_Read : array (0 .. 3) of Natural := (others => 0);
   begin
      Clear_Outputs;
      Ensure_Happy;
      if Inputs (0) >= 1.5 then
         --  Connected arc: erase the first N rim legs in angle order.
         declare
            Ids : array (0 .. 255) of Natural;
            Ang : array (0 .. 255) of F;
            N : Natural := 0;
            Want : Integer;
         begin
            for T in 0 .. Happy_N - 1 loop
               for E in 0 .. 4 loop
                  if Happy_Legs (T, E).Kind = Boundary then
                     declare
                        Mid : constant C :=
                          Scale (0.5, Add (Happy_Tiles (T) (E),
                                           Happy_Tiles (T) ((E + 1) mod 5)));
                     begin
                        Ids (N) := Happy_Legs (T, E).Ref;
                        Ang (N) := Atan2 (Mid.Y, Mid.X);
                        N := N + 1;
                     end;
                  end if;
               end loop;
            end loop;
            for I in 1 .. N - 1 loop
               declare
                  Key_Id : constant Natural := Ids (I);
                  Key_Ang : constant F := Ang (I);
                  J : Natural := I;
               begin
                  while J > 0 and then Ang (J - 1) > Key_Ang loop
                     Ids (J) := Ids (J - 1);
                     Ang (J) := Ang (J - 1);
                     J := J - 1;
                  end loop;
                  Ids (J) := Key_Id;
                  Ang (J) := Key_Ang;
               end;
            end loop;
            if not Finite (Inputs (1)) then
               Want := 0;
            elsif Inputs (1) <= 0.0 then
               Want := 0;
            else
               Want := Integer (Inputs (1));
            end if;
            if Want > Integer (N) then
               Want := Integer (N);
            end if;
            for I in 0 .. Want - 1 loop
               Erased (Ids (I)) := True;
            end loop;
         end;
      elsif Inputs (0) >= 0.5 then
         Pattern := Integer (Inputs (1));
         case Pattern is
            when 1 =>
               for B in 0 .. Happy_Boundary - 1 loop
                  Erased (B) := True;
               end loop;
            when 5 =>
               --  Two rim legs on every outer pentagon. Each one then sees
               --  fewer than three sides, so the greedy rule never starts.
               declare
                  Taken : array (0 .. Max_Tiles - 1) of Natural := (others => 0);
               begin
                  for T in 0 .. Happy_N - 1 loop
                     for E in 0 .. 4 loop
                        if Happy_Legs (T, E).Kind = Boundary
                          and then Taken (T) < 2
                        then
                           Erased (Happy_Legs (T, E).Ref) := True;
                           Taken (T) := Taken (T) + 1;
                        end if;
                     end loop;
                  end loop;
               end;
            when others =>
               null;
         end case;
      end if;

      Changed := True;
      while Changed loop
         Changed := False;
         for T in 0 .. Happy_N - 1 loop
            if not Known (T) then
               Known_Legs := 0;
               for E in 0 .. 4 loop
                  if Happy_Legs (T, E).Kind = Boundary then
                     if not Erased (Happy_Legs (T, E).Ref) then
                        Known_Legs := Known_Legs + 1;
                     end if;
                  elsif Known (Happy_Legs (T, E).Ref) then
                     Known_Legs := Known_Legs + 1;
                  end if;
               end loop;
               if Known_Legs >= 3 then
                  Known (T) := True;
                  Changed := True;
               end if;
            end if;
         end loop;
      end loop;

      Read_Count := 0;
      Erased_Count := 0;
      for B in 0 .. Happy_Boundary - 1 loop
         if Erased (B) then
            Erased_Count := Erased_Count + 1;
         end if;
      end loop;
      for T in 0 .. Happy_N - 1 loop
         if Known (T) and then Happy_Layer (T) <= 3 then
            Read_Count := Read_Count + 1;
            L_Read (Happy_Layer (T)) := L_Read (Happy_Layer (T)) + 1;
         end if;
      end loop;
      Ok;
      Outputs (2) := F (Happy_N);
      Outputs (3) := F (Happy_Boundary);
      Outputs (4) := F (Read_Count);
      Outputs (5) := F (L_Read (0));
      Outputs (6) := F (L_Read (1));
      Outputs (7) := F (L_Read (2));
      Outputs (8) := F (L_Read (3));
      Outputs (9) := F (Erased_Count);
      Outputs (10) := (if Happy_N > 0 and then Known (0) then 1.0 else 0.0);
      Outputs (11) := (if Read_Count = 0 and then Erased_Count > 0
                         and then Erased_Count < Happy_Boundary then 1.0 else 0.0);
      Outputs (12) := F (Layer_Total (0));
      Outputs (13) := F (Layer_Total (1));
      Outputs (14) := F (Layer_Total (2));
      Outputs (15) := F (Layer_Total (3));
      Geom_I (0) := Happy_N;
      Geom_I (1) := Happy_Boundary;
      Geom_I (2) := Read_Count;
      Geom_I (3) := 5;
      Geom_I (4) := Samples;
      for T in 0 .. Happy_N - 1 loop
         for E in 0 .. 4 loop
            Write_Edge
              (Happy_Tiles (T) (E),
               Happy_Tiles (T) ((E + 1) mod 5),
               Slot, Samples);
         end loop;
         Geom_I (400 + T) := (if Known (T) then 1 else 0);
         Geom_I (300 + T) := Happy_Layer (T);
      end loop;
      Geom_I (5) := Slot;
      Geom_I (6) := Slot;
      --  Boundary dots are stored by boundary id so the page can toggle them.
      Slot := Slot + Happy_Boundary * 2;
      for T in 0 .. Happy_N - 1 loop
         for E in 0 .. 4 loop
            if Happy_Legs (T, E).Kind = Boundary then
               declare
                  Bid : constant Natural := Happy_Legs (T, E).Ref;
                  Mid : constant C :=
                    Scale (0.5, Add (Happy_Tiles (T) (E), Happy_Tiles (T) ((E + 1) mod 5)));
                  Pos : constant Natural := Geom_I (6) + Bid * 2;
               begin
                  Geom (Pos) := Mid.X;
                  Geom (Pos + 1) := Mid.Y;
                  Geom_I (600 + Bid) := (if Erased (Bid) then 1 else 0);
                  Geom_I (800 + Bid) := T;
               end;
            end if;
         end loop;
      end loop;
      Geom_I (7) := Slot;
      for T in 0 .. Happy_N - 1 loop
         declare
            Acc : C := (0.0, 0.0);
         begin
            for E in 0 .. 4 loop
               Acc := Add (Acc, Happy_Tiles (T) (E));
            end loop;
            Acc := Scale (0.2, Acc);
            Geom (Slot) := Acc.X;
            Geom (Slot + 1) := Acc.Y;
            Slot := Slot + 2;
         end;
      end loop;
   end Do_Happy;

   function Hawking_T (Mass : F) return F is
     (Hbar * C_Light * C_Light * C_Light / (8.0 * Pi * G_Newton * Mass * K_B));

   function Hawking_Seconds (Mass : F) return F is
     (5120.0 * Pi * G_Newton * G_Newton * Mass * Mass * Mass
        / (Hbar * C_Light * C_Light * C_Light * C_Light));

   procedure Store_Hawking (Mass : F; Slot : Natural) is
   begin
      Outputs (Slot) := Mass;
      Outputs (Slot + 1) := Hawking_T (Mass);
      Outputs (Slot + 2) := Hawking_Seconds (Mass) / Year_Seconds;
   end Store_Hawking;

   procedure Do_Hawking is
      Mass : constant F := Inputs (0);
   begin
      Clear_Outputs;
      Store_Hawking (Mass_Sun, 6);
      Store_Hawking (Mountain_Kg, 9);
      if not Finite (Mass) then
         Fail (Err_Missing);
         return;
      end if;
      if Mass <= 0.0 then
         Fail (Err_Positive);
         return;
      end if;
      if Mass > 1.0E40 or else not Finite (Hawking_T (Mass))
        or else not Finite (Hawking_Seconds (Mass))
      then
         Fail (Err_Range);
         return;
      end if;
      Ok;
      Store_Hawking (Mass, 2);
      Store_Hawking (Mass_Sun, 6);
      Store_Hawking (Mountain_Kg, 9);
      Ok;
   end Do_Hawking;

   --  Round everyday sizes, not CODATA. The formulas use the CODATA constants.
   procedure Box_Of (Radius, Mass : F; Bek, Holo : out F) is
      Lp2 : constant F := Planck_Length_Sq;
   begin
      Bek := 2.0 * Pi * Radius * Mass * C_Light / Hbar;
      Holo := Pi * Radius * Radius / Lp2;
   end Box_Of;

   procedure Store_Box (Radius, Mass : F; Slot : Natural) is
      Bek, Holo : F;
   begin
      Box_Of (Radius, Mass, Bek, Holo);
      Outputs (Slot) := Radius;
      Outputs (Slot + 1) := Mass;
      Outputs (Slot + 2) := Bek;
      Outputs (Slot + 3) := Holo;
   end Store_Box;

   procedure Do_Box is
      Which : constant Integer := Integer (Inputs (0));
      Radius, Mass, Bek, Holo : F;
   begin
      Clear_Outputs;
      Store_Box (0.2, 1.0, 16);
      Store_Box (0.08, 1.4, 20);
      Store_Box (4.4E26, 1.5E53, 24);
      case Which is
         when 0 =>
            Radius := 0.2;
            Mass := 1.0;
         when 1 =>
            Radius := 0.08;
            Mass := 1.4;
         when 2 =>
            Radius := 4.4E26;
            Mass := 1.5E53;
         when 3 =>
            Radius := Inputs (1);
            Mass := Inputs (2);
         when others =>
            Fail (Err_Range);
            return;
      end case;
      if not Finite (Radius) or else not Finite (Mass) then
         Fail (Err_Missing);
         return;
      end if;
      if Radius <= 0.0 or else Mass <= 0.0 then
         Fail (Err_Positive);
         return;
      end if;
      Box_Of (Radius, Mass, Bek, Holo);
      if not Finite (Bek) or else not Finite (Holo) then
         Fail (Err_Range);
         return;
      end if;
      Ok;
      Outputs (2) := Radius;
      Outputs (3) := Mass;
      Outputs (4) := Bek;
      Outputs (5) := Holo;
      Outputs (6) := Bek / Ln2;
      Outputs (7) := Holo / Ln2;
      Outputs (8) := (Bek / Ln2) / Drive_Bits;
      Outputs (9) := (Holo / Ln2) / Drive_Bits;
      Outputs (10) := (if Bek <= Holo then 1.0 else 2.0);
      Store_Box (0.2, 1.0, 16);
      Store_Box (0.08, 1.4, 20);
      Store_Box (4.4E26, 1.5E53, 24);
      Ok;
   end Do_Box;

   procedure Run (Card : Integer) is
   begin
      case Card is
         when 0 => Splash_Frame (False);
         when 1 => Do_Black_Hole;
         when 2 => Do_Ball;
         when 3 => Do_Disk;
         when 4 => Do_Geodesic;
         when 5 => Do_Happy;
         when 6 => Do_Constants;
         when 7 => Do_Hawking;
         when 8 => Do_Box;
         when others => Fail (Err_Range);
      end case;
   end Run;

   procedure Tick is
   begin
      Splash_Frame (True);
   end Tick;

end HP.Cards;
