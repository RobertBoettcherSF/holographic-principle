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

   --  Three rings of the pentagon code. Counts follow the HaPPY layer recurrence.
   Inputs (0) := 1.0;
   Inputs (1) := 0.0;
   HP.Cards.Run (5);
   Check_I ("happy tiles", Integer (Outputs (2)), 61);
   Check_I ("happy boundary", Integer (Outputs (3)), 145);
   Check_I ("happy all readable", Integer (Outputs (4)), 61);
   Check_I ("layer totals", Integer (Outputs (12) + Outputs (13) + Outputs (14) + Outputs (15)), 61);

   Inputs (0) := 2.0;
   Inputs (1) := 20.0;
   HP.Cards.Run (5);
   Check_I ("arc 20 still has the centre", Integer (Outputs (10)), 1);
   Check_I ("arc 20 readable", Integer (Outputs (4)), 54);
   Check_I ("arc 20 outer ring has shrunk", Integer (Outputs (8)), 35);
   if Integer (Outputs (6)) /= 5 or else Integer (Outputs (7)) /= 13 then
      Errors := Errors + 1;
      Put_Line ("FAIL arc 20 did not keep the inner rings");
   end if;

   Inputs (1) := 50.0;
   HP.Cards.Run (5);
   Check_I ("arc 50 centre gone", Integer (Outputs (10)), 0);
   Check_I ("arc 50 some rings remain", Integer (Outputs (4)), 37);

   Inputs (0) := 1.0;
   Inputs (1) := 5.0;
   HP.Cards.Run (5);
   Check_I ("greedy stuck readable", Integer (Outputs (4)), 0);
   Check_I ("greedy stuck flag", Integer (Outputs (11)), 1);
   Check_I ("greedy stuck keeps some rim", Integer (Outputs (9)), 80);

   Inputs (1) := 1.0;
   HP.Cards.Run (5);
   Check_I ("happy all erased", Integer (Outputs (4)), 0);
   Check_I ("all erased is not the stuck case", Integer (Outputs (11)), 0);

   Inputs (0) := Mass_Sun;
   HP.Cards.Run (7);
   Check_I ("hawking status", Integer (Outputs (0)), 1);
   Check ("T sun", Outputs (3), 6.170260410964976e-8, 1.0e-9);
   Check ("life sun years", Outputs (4), 2.095492313809034e67, 1.0e-9);
   Check ("T mountain", Outputs (10), 1.2269006705940171e12, 1.0e-9);
   Check ("life mountain years", Outputs (11), 2.6654365033152413e9, 1.0e-9);
   if Outputs (11) >= Outputs (8) then
      Errors := Errors + 1;
      Put_Line ("FAIL mountain does not fade before the Sun");
   end if;
   Inputs (0) := 0.0;
   HP.Cards.Run (7);
   Check_I ("reject zero hawking mass", Integer (Outputs (1)), Err_Positive);

   Inputs (0) := 0.0;
   HP.Cards.Run (8);
   Check_I ("box status", Integer (Outputs (0)), 1);
   Check ("shoebox bek", Outputs (4), 3.5723533206363005e42, 1.0e-9);
   Check ("shoebox holo", Outputs (5), 4.81049854995961e68, 1.0e-9);
   Check_I ("shoebox tighter is Bekenstein", Integer (Outputs (10)), 1);
   Inputs (0) := 2.0;
   HP.Cards.Run (8);
   Check ("universe bek", Outputs (4), 1.1788765958099792e123, 1.0e-8);
   Check ("universe holo", Outputs (5), 2.328281298180451e123, 1.0e-8);
   Inputs (0) := 3.0;
   Inputs (1) := -1.0;
   Inputs (2) := 1.0;
   HP.Cards.Run (8);
   Check_I ("reject negative box radius", Integer (Outputs (1)), Err_Positive);

   if Errors = 0 then
      Put_Line ("SMOKE PASS");
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Success);
   else
      Put_Line ("SMOKE FAIL" & Integer'Image (Errors));
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Failure);
   end if;
end Smoke;
