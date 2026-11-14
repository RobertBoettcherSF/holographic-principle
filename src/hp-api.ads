--  Functions the browser calls. Inputs and results live in plain arrays
--  so the page can read them as Float64 / Int32 views of WebAssembly memory.
with System;

package HP.API is

   function Inputs_Address return System.Address
     with Export, Convention => C, External_Name => "hp_inputs";
   function Outputs_Address return System.Address
     with Export, Convention => C, External_Name => "hp_outputs";
   function Geom_Address return System.Address
     with Export, Convention => C, External_Name => "hp_geom";
   function Geom_I_Address return System.Address
     with Export, Convention => C, External_Name => "hp_geom_i";

   procedure Compute (Card : Integer)
     with Export, Convention => C, External_Name => "hp_compute";
   procedure Tick
     with Export, Convention => C, External_Name => "hp_tick";

end HP.API;
