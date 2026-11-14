--  Shared state for the holographic-principle tour.
--  The browser writes Inputs, calls Compute, then reads Outputs / Geom.
--  JavaScript does not redo the physics; it only draws these buffers.

package HP is

   subtype F is Long_Float;

   type F_Array is array (Natural range <>) of F;
   type I_Array is array (Natural range <>) of Integer;

   Inputs  : F_Array (0 .. 15) := (others => 0.0);
   Outputs : F_Array (0 .. 31) := (others => 0.0);
   Geom    : F_Array (0 .. 8191) := (others => 0.0);
   Geom_I  : I_Array (0 .. 1023) := (others => 0);

   for Inputs'Alignment use 8;
   for Outputs'Alignment use 8;
   for Geom'Alignment use 8;

   --  Outputs(0) is 1.0 when the card produced a result, else 0.0.
   --  Outputs(1) is an error code (0 when the result is valid):
   Err_None      : constant := 0;
   Err_Missing   : constant := 1;
   Err_Positive  : constant := 2;
   Err_Range     : constant := 3;
   Err_Whole     : constant := 4;
   Err_Close     : constant := 5;

   --  Physical constants. c, h and k_B are exact SI values.
   --  G is the CODATA 2022 recommended value.
   --  Solar and Earth masses use the IAU nominal GM divided by that G.
   C_Light  : constant F := 299_792_458.0;
   H_Planck : constant F := 6.626_070_15E-34;
   K_B      : constant F := 1.380_649E-23;
   G_Newton : constant F := 6.674_30E-11;
   Pi       : constant F := 3.14159265358979323846;
   Ln2      : constant F := 0.693147180559945309417;
   GM_Sun   : constant F := 1.327_124_4E20;
   GM_Earth : constant F := 3.986_004E14;

   --  Card 4 units: AdS radius ell = 1, G = 1/2, so Brown-Henneaux gives
   --  c = 3 ell / (2 G) = 3. Cutoff epsilon is the height z = eps in the
   --  upper half plane (stated on the card).
   Ads_Ell : constant F := 1.0;
   Ads_G   : constant F := 0.5;
   Ads_C   : constant F := 3.0;
   Ads_Eps : constant F := 0.02;

   procedure Clear_Outputs;

   function Finite (X : F) return Boolean is
     (X = X and then abs X <= 1.0E300);

   function Mass_Sun return F is (GM_Sun / G_Newton);
   function Mass_Earth return F is (GM_Earth / G_Newton);
   function Hbar return F is (H_Planck / (2.0 * Pi));
   function Planck_Length_Sq return F is
     (Hbar * G_Newton / (C_Light * C_Light * C_Light));

end HP;
