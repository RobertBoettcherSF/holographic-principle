with HP.Cards;

package body HP.API is

   function Inputs_Address return System.Address is (Inputs'Address);
   function Outputs_Address return System.Address is (Outputs'Address);
   function Geom_Address return System.Address is (Geom'Address);
   function Geom_I_Address return System.Address is (Geom_I'Address);

   procedure Compute (Card : Integer) is
   begin
      HP.Cards.Run (Card);
   end Compute;

   procedure Tick is
   begin
      HP.Cards.Tick;
   end Tick;

end HP.API;
