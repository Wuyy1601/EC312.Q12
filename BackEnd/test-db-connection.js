import { userConnection, productConnection } from "./src/config/database.js";

console.log("Testing database connections...");

setTimeout(() => {
  console.log("\n=== User Connection ===");
  console.log("State:", userConnection?.readyState); // 1 = connected
  console.log("Name:", userConnection?.name);
  
  console.log("\n=== Product Connection ===");
  console.log("State:", productConnection?.readyState);
  console.log("Name:", productConnection?.name);
  
  console.log("\nReady states:");
  console.log("0 = disconnected");
  console.log("1 = connected");
  console.log("2 = connecting");
  console.log("3 = disconnecting");
  
  if (userConnection?.readyState === 1 && productConnection?.readyState === 1) {
    console.log("\n✅ Both connections ready!");
  } else {
    console.log("\n❌ Connections not ready!");
  }
  
  process.exit(0);
}, 2000);
