const dummyStreets = [
    {
        coordinates: [[-74.0060, 40.7128], [-74.0055, 40.7135], [-74.0048, 40.7142]], // Street A
        crimes: { robbery: 0.15, murder: 0.03, assault: 0.08, theft: 0.25 }
    },
    {
        coordinates: [[-74.0048, 40.7142], [-74.0039, 40.7150], [-74.0025, 40.7160]], // Street B
        crimes: { robbery: 0.10, murder: 0.01, assault: 0.05, theft: 0.20 }
    },
    {
        coordinates: [[-74.0025, 40.7160], [-74.0018, 40.7172], [-74.0005, 40.7185]], // Street C
        crimes: { robbery: 0.25, murder: 0.07, assault: 0.18, theft: 0.35 }
    },
    {
        coordinates: [[-74.0060, 40.7128], [-74.0039, 40.7150]], // Street D (short road)
        crimes: { robbery: 0.05, murder: 0.02, assault: 0.03, theft: 0.15 }
    },
    {
        coordinates: [[-74.0005, 40.7185], [-73.9998, 40.7195]], // Street E
        crimes: { robbery: 0.12, murder: 0.05, assault: 0.10, theft: 0.22 }
    }
];

// Detect street intersections dynamically
function findIntersections(streets) {
    const intersections = [];

    for (let i = 0; i < streets.length; i++) {
        for (let j = i + 1; j < streets.length; j++) {
            const s1 = streets[i];
            const s2 = streets[j];

            for (const point1 of s1.coordinates) {
                if (s2.coordinates.some(point2 => JSON.stringify(point1) === JSON.stringify(point2))) {
                    intersections.push({ streets: [s1, s2], coordinates: point1 });
                }
            }
        }
    }

    return intersections;
}

// Helper function: Check if two points are within a small distance
function arePointsClose(point1, point2, threshold = 0.0005) {
    const [lng1, lat1] = point1;
    const [lng2, lat2] = point2;
    return Math.sqrt((lng1 - lng2) ** 2 + (lat1 - lat2) ** 2) < threshold;
}

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

async function findEfficientPath(start, end, streetsWithWeights) {
    const graph = new Graph();
    const intersections = findIntersections(streetsWithWeights);

    streetsWithWeights.forEach((street, index) => {
        graph.addNode(`Street ${index}`);
    });

    console.log('Graph Nodes:', graph.nodes);

    intersections.forEach(({ streets, coordinates }) => {
        const s1 = streetsWithWeights.indexOf(streets[0]);
        const s2 = streetsWithWeights.indexOf(streets[1]);

        if (s1 !== -1 && s2 !== -1) {
            const weight = calculateCombinedWeight(streets[0], streets[1], coordinates);
            graph.addEdge(`Street ${s1}`, `Street ${s2}`, weight);
            console.log(`Edge added: Street ${s1} -> Street ${s2}, Weight: ${weight}`);
        }
    });

    console.log('Graph Edges:', graph.edges);

    const path = graph.dijkstra(`Street ${streetsWithWeights.indexOf(start)}`, `Street ${streetsWithWeights.indexOf(end)}`);

    return path ? path : `No path found between start and end`;
}

function calculateCombinedWeight(street1, street2, intersection) {
    const safety = (calculateSafetyScore(street1.crimes) + calculateSafetyScore(street2.crimes)) / 2;
    const lengthWeight = 0.7;
    const safetyWeight = 0.3;
    return (lengthWeight * 0.5) + (safetyWeight * (1 - safety)); // Basic combined weight formula
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
    const start = dummyStreets[0]; // Street A
    const end = dummyStreets[dummyStreets.length - 1]; // Street E

    const efficientPath = await findEfficientPath(start, end, dummyStreets);
    console.log('Efficient Path:', efficientPath);
}

main();
