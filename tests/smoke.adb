--  Small numeric smoke check. Expected values were computed independently
--  in Python from the same CODATA / IAU constants and the same textbook
--  formulas, then pasted here. Build: gprbuild -P tests/smoke.gpr
with Ada.Command_Line;
with Ada.Text_IO; use Ada.Text_IO;
with HP; use HP;
with HP.Cards;
with HP.Math;

procedure Smoke is
   Errors : Natural := 0;

   procedure Check (Name : String; Got, Expected, Rel : F) is
      Scale : constant F := (if abs Expected > 1.0 then abs Expected else 1.0);
      Diff  : constant F := abs (Got - Expected);
   begin
      if Diff > Rel * Scale then
         Errors := Errors + 1;
         Put_Line ("FAIL " & Name & " got " & F'Image (Got) & " expected " & F'Image (Expected));
      else
         Put_Line ("ok   " & Name);
      end if;
   end Check;

   procedure Check_I (Name : String; Got, Expected : Integer) is
   begin
      if Got /= Expected then
         Errors := Errors + 1;
         Put_Line ("FAIL " & Name & " got" & Integer'Image (Got) & " expected" & Integer'Image (Expected));
      else
         Put_Line ("ok   " & Name);
      end if;
   end Check_I;

   M_Sun : constant F := 1.988409870698051e30;
   M_Earth : constant F := 5.972167867791379e24;
begin
   Check ("ln 2", HP.Math.Ln (2.0), 0.6931471805599453, 1.0e-12);
   Check ("ln 10", HP.Math.Ln (10.0), 2.302585092994046, 1.0e-12);
   Check ("sqrt 2", HP.Math.Sqrt (2.0), 1.4142135623730951, 1.0e-12);
   Check ("sin pi/6", HP.Math.Sin (Pi / 6.0), 0.5, 1.0e-12);
   Check ("sin pi/2", HP.Math.Sin (Pi / 2.0), 1.0, 1.0e-12);
   Check ("sin pi", HP.Math.Sin (Pi), 0.0, 1.0e-12);
   Check ("cos pi", HP.Math.Cos (Pi), -1.0, 1.0e-12);
   Check ("sin -pi/2", HP.Math.Sin (-Pi / 2.0), -1.0, 1.0e-12);
   Check ("cos 0", HP.Math.Cos (0.0), 1.0, 1.0e-12);
   Check ("atan2 1,1", HP.Math.Atan2 (1.0, 1.0), Pi / 4.0, 1.0e-12);
   Check ("atan2 0,-1", HP.Math.Atan2 (0.0, -1.0), Pi, 1.0e-12);
   Check ("arccos 0.5", HP.Math.Arccos (0.5), Pi / 3.0, 1.0e-12);

   Check ("M sun", Mass_Sun, M_Sun, 1.0e-12);
   Check ("M earth", Mass_Earth, M_Earth, 1.0e-12);
   Check ("l_P", HP.Math.Sqrt (Planck_Length_Sq), 1.6162550244237053e-35, 1.0e-9);

   Inputs (0) := 0.0;
   Inputs (1) := Mass_Sun;
   HP.Cards.Run (1);
   Check_I ("bh status", Integer (Outputs (0)), 1);
   Check ("rs sun m", Outputs (3), 2953.25007610025, 1.0e-9);
   Check ("S/k sun", Outputs (5), 1.0488914478465575e77, 1.0e-9);
   Check ("bits sun", Outputs (6), 1.5132304902390732e77, 1.0e-9);
   --  User's round figures.
   if Outputs (3) < 2940.0 or else Outputs (3) > 2970.0 then
      Errors := Errors + 1;
      Put_Line ("FAIL rs sun not about 2.95 km");
   end if;
   if Outputs (5) < 0.9e77 or else Outputs (5) > 1.2e77 then
      Errors := Errors + 1;
      Put_Line ("FAIL S/k not about 1e77");
   end if;

   Inputs (0) := 0.0;
   Inputs (1) := Mass_Earth;
   HP.Cards.Run (1);
   Check ("rs earth m", Outputs (3), 0.008870055148059894, 1.0e-9);

   --  Rearrangement: radius of the Sun back to its mass.
   Inputs (0) := 1.0;
   Inputs (1) := 2953.25007610025;
   HP.Cards.Run (1);
   Check ("mass from rs", Outputs (2), M_Sun, 1.0e-9);

   Inputs (0) := 2.0;
   Inputs (1) := 1.5132304902390732e77;
   HP.Cards.Run (1);
   Check ("mass from bits", Outputs (2), M_Sun, 1.0e-8);

   Inputs (0) := 0.0;
   Inputs (1) := 0.0;
   HP.Cards.Run (1);
   Check_I ("reject zero mass", Integer (Outputs (1)), Err_Positive);

   Inputs (0) := 0.0;
   Inputs (1) := -5.0;
   HP.Cards.Run (1);
   Check_I ("reject negative mass", Integer (Outputs (1)), Err_Positive);

   Inputs (0) := 4.0;
   HP.Cards.Run (2);
   Check_I ("ball status", Integer (Outputs (0)), 1);
   Check ("cubes r4", Outputs (2), 257.0, 0.0);
   Check ("stickers r4", Outputs (3), 294.0, 0.0);
   Check ("cubes r8", Outputs (6), 2109.0, 0.0);
   Check ("stickers r8", Outputs (7), 1182.0, 0.0);
   --  Doubling the radius multiplies the smooth volume by 8 and the area by 4.
   Check ("r from area", Outputs (12), 4.0, 1.0e-12);
   Check ("r from volume", Outputs (13), 4.0, 1.0e-9);
   if Outputs (6) / Outputs (2) <= Outputs (7) / Outputs (3) then
      Errors := Errors + 1;
      Put_Line ("FAIL surface did not grow more slowly than volume");
   end if;

   Inputs (0) := 1.5;
   HP.Cards.Run (2);
   Check_I ("reject fractional cubes", Integer (Outputs (1)), Err_Whole);
   Inputs (0) := 0.0;
   HP.Cards.Run (2);
   Check_I ("reject zero radius", Integer (Outputs (1)), Err_Positive);

   Inputs (0) := 0.0;
   Inputs (1) := 0.0;
   Inputs (2) := 0.5;
   Inputs (3) := 0.0;
   HP.Cards.Run (3);
   Check_I ("disk status", Integer (Outputs (0)), 1);
   Check_I ("heptagon tiles", Geom_I (0), 85);
   Check ("phi at rho 0.5", Outputs (8), 0.6435011087932843, 1.0e-8);

   Inputs (0) := 0.4;
   Inputs (1) := 2.4;
   HP.Cards.Run (4);
   Check_I ("geo status", Integer (Outputs (0)), 1);
   Check ("chord L", Outputs (3), 1.682941969615793, 1.0e-9);
   Check ("length", Outputs (5), 8.864850362997434, 1.0e-8);
   Check ("S rt", Outputs (6), 4.432425181498717, 1.0e-8);
   Check ("S cft", Outputs (7), 4.432566439718999, 1.0e-8);
   Check ("doubling adds (c/3) ln 2", Outputs (12), Ln2, 1.0e-12);
   if abs (Outputs (6) - Outputs (7)) / Outputs (7) > 1.0e-3 then
      Errors := Errors + 1;
      Put_Line ("FAIL RT and CFT entropies disagree");
   end if;
   Inputs (0) := 1.0;
   Inputs (1) := 1.01;
   HP.Cards.Run (4);
   Check_I ("reject coincident points", Integer (Outputs (1)), Err_Close);

   --  HaPPY patterns: 0 none, 2 one boundary leg per tile, 3 two per tile,
   --  4 the first two outer pentagons fully erased.
   Inputs (0) := 1.0;
   Inputs (1) := 0.0;
   HP.Cards.Run (5);
   Check_I ("happy tiles", Integer (Outputs (2)), 6);
   Check_I ("happy boundary", Integer (Outputs (3)), 20);
   Check_I ("happy none erased", Integer (Outputs (4)), 6);

   Inputs (1) := 2.0;
   HP.Cards.Run (5);
   Check_I ("happy one each", Integer (Outputs (4)), 6);

   Inputs (1) := 3.0;
   HP.Cards.Run (5);
   Check_I ("happy two each", Integer (Outputs (4)), 0);

   Inputs (1) := 4.0;
   HP.Cards.Run (5);
   Check_I ("happy two petals", Integer (Outputs (4)), 4);
   Check_I ("center still readable", Geom_I (100), 1);

   Inputs (1) := 1.0;
   HP.Cards.Run (5);
   Check_I ("happy all erased", Integer (Outputs (4)), 0);

   if Errors = 0 then
      Put_Line ("SMOKE PASS");
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Success);
   else
      Put_Line ("SMOKE FAIL" & Integer'Image (Errors));
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Failure);
   end if;
end Smoke;
