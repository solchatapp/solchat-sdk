import {
  Visitor,
  createFromIdls,
  renderJavaScriptVisitor,
  setAnchorDiscriminatorsVisitor,
  renderJavaScriptExperimentalVisitor,
  pdaNode,
  addPdasVisitor,
  constantPdaSeedNodeFromString,
  variablePdaSeedNode,
  publicKeyTypeNode,
  numberTypeNode,
} from "@metaplex-foundation/kinobi";
import path from "path";

// Instantiate Kinobi.
const kinobi = createFromIdls([path.join(__dirname, "idls", "solchat.json")]);

// Update the Kinobi tree using visitors...

// Render JavaScript.
const jsDir = path.join(__dirname, "clients", "ts", "src", "generated");

// Doesn't work on non-experimental mode
kinobi.update(
  addPdasVisitor({
    solchat: [
      {
        name: "user",
        seeds: [
          constantPdaSeedNodeFromString("user"),
          variablePdaSeedNode("owner", publicKeyTypeNode()),
        ],
      },
      {
        name: "group",
        seeds: [
          constantPdaSeedNodeFromString("group"),
          variablePdaSeedNode("id", numberTypeNode('u64', 'le')),
        ],
      },
    ],
  })
);

kinobi.accept(renderJavaScriptVisitor(jsDir) as Visitor<void>);
