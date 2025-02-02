const dummyStreets = [
    { name: 'Street A', latitude: 40.7128, longitude: -74.0060, crimes: { robbery: 0.15, murder: 0.03, assault: 0.08, theft: 0.25 } },
    { name: 'Street B', latitude: 40.7135, longitude: -74.0055, crimes: { robbery: 0.10, murder: 0.01, assault: 0.05, theft: 0.20 } },
    { name: 'Street C', latitude: 40.7142, longitude: -74.0048, crimes: { robbery: 0.25, murder: 0.07, assault: 0.18, theft: 0.35 } },
    { name: 'Street D', latitude: 40.7150, longitude: -74.0039, crimes: { robbery: 0.05, murder: 0.02, assault: 0.03, theft: 0.15 } },
    { name: 'Street E', latitude: 40.7160, longitude: -74.0025, crimes: { robbery: 0.12, murder: 0.05, assault: 0.10, theft: 0.22 } },
    { name: 'Street F', latitude: 40.7172, longitude: -74.0018, crimes: { robbery: 0.08, murder: 0.02, assault: 0.06, theft: 0.18 } },
    { name: 'Street G', latitude: 40.7185, longitude: -74.0005, crimes: { robbery: 0.18, murder: 0.06, assault: 0.12, theft: 0.30 } },
    { name: 'Street H', latitude: 40.7195, longitude: -73.9998, crimes: { robbery: 0.09, murder: 0.04, assault: 0.07, theft: 0.20 } },
];

// Multiple path options (some indirect, some direct)
const streetConnections = [
    ['Street A', 'Street B'],
    ['Street A', 'Street C'],
    ['Street B', 'Street D'],
    ['Street C', 'Street D'],
    ['Street C', 'Street E'],
    ['Street D', 'Street F'],
    ['Street E', 'Street F'],
    ['Street F', 'Street G'],
    ['Street E', 'Street G'],
    ['Street G', 'Street H'],
];

class Graph {
    constructor() {
        this.nodes = new Set();
        this.edges = {};
    }

    addNode(node) {
        this.nodes.add(node);
        this.edges[node] = {};
    }

    addEdge(node1, node2, weight) {
        this.edges[node1][node2] = weight;
        this.edges[node2][node1] = weight;
    }

    dijkstra(startNode, endNode) {
        if (!(startNode in this.edges) || !(endNode in this.edges)) {
            return null;
        }

        const distances = {};
        const previous = {};
        const queue = new PriorityQueue();
        const visited = new Set();

        for (let node of this.nodes) {
            distances[node] = node === startNode ? 0 : Infinity;
            queue.enqueue(node, distances[node]);
            previous[node] = null;
        }

        while (!queue.isEmpty()) {
            const currentNode = queue.dequeue().element;
            if (currentNode === endNode) {
                const path = [];
                let node = endNode;
                while (node !== null) {
                    path.unshift(node);
                    node = previous[node];
                }
                return path.length > 1 ? path : null;
            }

            visited.add(currentNode);

            for (let neighbor in this.edges[currentNode]) {
                if (!visited.has(neighbor)) {
                    const distance = distances[currentNode] + this.edges[currentNode][neighbor];
                    if (distance < distances[neighbor]) {
                        distances[neighbor] = distance;
                        previous[neighbor] = currentNode;
                        queue.enqueue(neighbor, distance);
                    }
                }
            }
        }

        return null;
    }
}

class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.elements.shift();
    }

    isEmpty() {
        return this.elements.length === 0;
    }
}

async function findEfficientPath(start, end, streetsWithWeights, connections) {
    const graph = new Graph();

    streetsWithWeights.forEach(street => {
        graph.addNode(street.name);
    });

    console.log('Graph Nodes:', graph.nodes);

    connections.forEach(([street1, street2]) => {
        const s1 = streetsWithWeights.find(s => s.name === street1);
        const s2 = streetsWithWeights.find(s => s.name === street2);

        if (s1 && s2) {
            const weight = calculateCombinedWeight(s1, s2);
            graph.addEdge(street1, street2, weight);
            console.log(`Edge added: ${street1} -> ${street2}, Weight: ${weight}`);
        }
    });

    console.log('Graph Edges:', graph.edges);

    const path = graph.dijkstra(start.name, end.name);

    return path ? path : `No path found between ${start.name} and ${end.name}`;
}

function calculateCombinedWeight(street1, street2) {
    const length = calculateDistance(street1, street2);
    const safety = calculateSafetyScore(street1.crimes);
    const lengthWeight = 0.7;
    const safetyWeight = 0.3;
    const normalizedLength = length / 1000;
    const normalizedSafety = 1 - safety;
    return (lengthWeight * normalizedLength) + (safetyWeight * normalizedSafety);
}

function calculateDistance(street1, street2) {
    const latDiff = street1.latitude - street2.latitude;
    const lngDiff = street1.longitude - street2.longitude;
    return Math.sqrt(latDiff ** 2 + lngDiff ** 2);
}

function calculateSafetyScore(crimes) {
    const crimeWeights = { robbery: 0.4, murder: 0.8, assault: 0.6, theft: 0.3 };
    let totalWeight = 0, weightedSum = 0;
    for (const crime in crimes) {
        if (crimeWeights[crime]) {
            weightedSum += crimes[crime] * crimeWeights[crime];
            totalWeight += crimeWeights[crime];
        }
    }
    return weightedSum / totalWeight;
}

async function main() {
    const start = { name: 'Street A', latitude: 40.7128, longitude: -74.0060 };
    const end = { name: 'Street H', latitude: 40.7195, longitude: -73.9998 };

    const efficientPath = await findEfficientPath(start, end, dummyStreets, streetConnections);
    console.log('Efficient Path:', efficientPath);
}

main();
