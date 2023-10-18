export default {
    "MaliksMajik": {
        "equipping": {
            "modal": {
                "title": "You are equipping an item",
                "text": ({ anonId, proof }: { anonId: string, proof: string }) => 
                    `Let Malik's Majik bless you with his power and lead you to your jinni!`,
            },
        },
        "equipped": {
            "modal": {
                "title": "You have sucessfully equipped your item!",
                "text": `Over a great many battles you have won the honor to claim this item in your ether bag`,
            },
        },
        "post-equip": {
            "modal": {
                "title": "Congrats on acquiring your new item!",
                "text": ({ anonId, proof }: { anonId: string, proof: string }) => 
                        `${anonId} has been blessed with Malik's Majik! \n Proof: ${proof}`,
            },
        },
    },
    "AndroidHealthConnect": {
        "equipping": {
            "modal": {
                "title": "You are equipping an item",
                "text": ({ anonId, proof }: { anonId: string, proof: string }) => 
                    `You are letting your jinni absorb power from the energy you generate with your phone`,
            },
        },
        "equipped": {
            "modal": {
                "title": "You have sucessfully equipped your item!",
                "text": `Your Jinni is more connected to you and the physical world than ever! Keep your phone on you while you walk and exercise to generate energy for them`,
            },
        },
        "post-equip": {
            "modal": {
                "title": "Congrats on acquiring your new item!",
                "text": `Your Jinni is more connected to you and the physical world than ever! Keep your phone on you while you walk and exercise to generate energy for them`,
            },
        },
    },
}