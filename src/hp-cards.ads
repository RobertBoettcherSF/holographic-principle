--  One procedure per tour stop. Run dispatches on the card number
--  the browser passes to hp_compute.
package HP.Cards is

   procedure Run (Card : Integer);
   procedure Tick;

end HP.Cards;
