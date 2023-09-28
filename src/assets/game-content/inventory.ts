export default {
    "inventory": {
        "equipped": {
            "modal": {
                "title": "You are equipping an item",
            },
            "items": {
                "master-djinn-summoning-circle": `Over a great many battles you ahve won the honor to claim this item in your ether bag`,
            },
        },
        "equipping": {
            "modal": {
                "title": "You are equipping an item",
            },
            "items": {
                "master-djinn-summoning-circle": ({ anonId, proof }: { anonId: string, proof: string }) => 
                    `Let the Master Djinn bless you with his power and lead you to your jinni!`,
            },
        },  
        "post-equip": {
            "modal": {
                "title": "Congrats on acquiring your new item!",
            },
            "items": {
                "master-djinn-summoning-circle": ({ anonId, proof }: { anonId: string, proof: string }) => 
                    `${anonId} has summoned the Master Djinn! \n Proof: ${proof}`,
            },
        },
    }
}