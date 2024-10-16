fn genProof(msg: Field, jmid: Field) -> pub boolean {
    // generate proof that msg was signed by jmid
    // and that jmid is part of original list provided
    // and that 
    // 
    msg
}

fn main(pid: Field, jubs: [Field; N]) -> pub Field {
    let mut result = 0;

    for i in 0..len(jubs) {
        let proof = genProof(msg, jubs[i]);
        // sick to do aggregated proof everytime its true
        // so can prove n jubs signed off on you at once
        if(proof) {
            result = proof;
            break;
        }
    }

    result
}

// #[test]
// fn test_main() {
//     assert(None, main("me", ["0x0000"]));
//     assert(True, main("me", ["0x0000", "0x2020"]));
//     assert(None, main("notme", ["0x0000", "0x2020"]));
// }


// merkle tree inclusion example in noir
// fn main(message : [Field; 62], index : Field, hashpath : [Field; 40], root : Field) {
    // let leaf = std::hash::hash_to_field(message.as_slice());
    // let merkle_root = std::merkle::compute_merkle_root(leaf, index, hashpath);
    // assert(merkle_root == root);
// }