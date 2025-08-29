// CRDT Sync Demo for HYPERCORE/AUTOMERGE
// To run this demo:
// 1. Make sure you have Node.js installed.
// 2. Run `npm install` in the root directory of this repository to install dependencies (like automerge).
// 3. Run `node pods/crdt/crdt_sync_demo.js`

const Automerge = require('automerge');

// 1. Initialize a document
let doc1 = Automerge.init();
doc1 = Automerge.change(doc1, 'Initialize document', doc => {
  doc.text = new Automerge.Text();
  doc.text.insertAt(0, ...'Hello, sovereign world!'.split(''));
});
console.log('Initial doc1 state:', Automerge.getText(doc1).toString());


// 2. Create a "peer" document and make a change
let doc2 = Automerge.clone(doc1);
doc2 = Automerge.change(doc2, 'Peer adds a sentence', doc => {
    doc.text.insertAt(23, ...' The system is alive.'.split(''));
});
console.log('Peer doc2 state after change:', Automerge.getText(doc2).toString());


// 3. Simulate syncing by merging the peer's changes back into the original document
let finalDoc = Automerge.merge(doc1, doc2);
console.log('Final merged state:', Automerge.getText(finalDoc).toString());

// You can inspect the history
const history = Automerge.getHistory(finalDoc);
console.log(`Document history has ${history.length} change(s).`);
