const RESOLUTION = 800;

let canvas;
let ctxt;

let showTree;
let showVisited;

let points;
let tree;

let mouseX = 0.5;
let mouseY = 0.5;
let rectMargin = 0.1;

window.onload = () => {
    canvas = document.getElementById("canvas");
    canvas.width = RESOLUTION;
    canvas.height = RESOLUTION;
    ctxt = canvas.getContext("2d");

    showTree = document.getElementById("showTree");
    showVisited = document.getElementById("showVisited");

    points = [];
    for (let i = 0; i < 100; i++) {
        points.push([
            0.8 * Math.random() + 0.1,
            0.8 * Math.random() + 0.1
        ]);
    }

    tree = new PrioritySearchTree(points);

    ctxt.strokeStyle = "#AAAA"
    ctxt.lineWidth = 0.003;

    document.addEventListener("mousemove", e => {
        let rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width;
        mouseY = (e.clientY - rect.top) / rect.height;
    });
    document.addEventListener("touchmove", e => {
        let rect = canvas.getBoundingClientRect();
        mouseX = (e.touches[0].clientX - rect.left) / rect.width;
        mouseY = (e.touches[0].clientY - rect.top) / rect.height;
    });

    loop();
}

function loop() {
    ctxt.clearRect(0, 0, canvas.width, canvas.height);

    ctxt.save();

    ctxt.setTransform(canvas.width, 0, 0, canvas.height, 0, 0);

    if(showTree.checked) {
        tree.render(ctxt);
    }

    ctxt.fillStyle = "#000";
    for (let point of points) {
        ctxt.beginPath();
        ctxt.arc(point[0], point[1], 0.003, 0, 2 * Math.PI);
        ctxt.fill();
    }

    let x1 = mouseX - rectMargin;
    let x2 = mouseX + rectMargin;
    let y2 = mouseY + rectMargin;

    ctxt.fillStyle = "#000A";
    ctxt.beginPath();
    ctxt.moveTo(x1, 0);
    ctxt.lineTo(x1, y2);
    ctxt.lineTo(x2, y2);
    ctxt.lineTo(x2, 0);
    ctxt.fill();
    ctxt.stroke();

    let visited = tree.query(x1, x2, y2);

    let inside = [];
    let outside = [];

    for(let point of visited) {
        if(point[0] > x1 && point[0] < x2 && point[1] < y2) {
            inside.push(point);
        } else {
            outside.push(point);
        }
    }

    if(showVisited.checked) {
        ctxt.fillStyle = "#09F";
        for (let point of outside) {
            ctxt.beginPath();
            ctxt.arc(point[0], point[1], 0.003, 0, 2 * Math.PI);
            ctxt.fill();
        }
    }

    ctxt.fillStyle = "#F90";
    for (let point of inside) {
        ctxt.beginPath();
        ctxt.arc(point[0], point[1], 0.003, 0, 2 * Math.PI);
        ctxt.fill();
    }

    ctxt.restore();

    requestAnimationFrame(loop);
}

class PrioritySearchTree {
    constructor(points) {
        let sorted = points.toSorted(([x1, y1], [x2, y2]) => y1 - y2);

        this.tree = new PrioritySearchTreeNode(sorted);
    }

    render(ctxt) {
        this.tree.render(ctxt);

        ctxt.lineTo(this.tree.point[0], 0);
        ctxt.stroke();
    }

    query(left, right, bottom) {
        let result = [];

        this.tree.query(left, right, bottom, result);

        return result;
    }
}

class PrioritySearchTreeNode {
    constructor(points) {
        this.point = points[0];
        let left = [];
        let right = [];
        for (let i = 1; i < points.length; i++) {
            if (points[i][0] < this.point[0]) {
                left.push(points[i]);
            } else {
                right.push(points[i]);
            }
        }

        if (left.length > 0) {
            this.left = new PrioritySearchTreeNode(left);
        } else {
            this.left = new PrioritySearchTreeEmptyNode();
        }

        if (right.length > 0) {
            this.right = new PrioritySearchTreeNode(right);
        } else {
            this.right = new PrioritySearchTreeEmptyNode();
        }
    }

    render(ctxt) {
        this.left.render(ctxt);
        ctxt.lineTo(this.point[0], this.point[1]);
        ctxt.stroke();

        this.right.render(ctxt);
        ctxt.lineTo(this.point[0], this.point[1]);
        ctxt.stroke();

        ctxt.beginPath();
        ctxt.moveTo(this.point[0], this.point[1])
    }

    query(left, right, bottom, result) {
        // technically we would need to check here if this point is actually contained or not
        // for visualization purposes this is done somewhere else
        result.push(this.point);

        if(bottom < this.point[1]) {
            return;
        }

        if(left < this.point[0]) {
            this.left.query(left, right, bottom, result);
        }

        if(right > this.point[0]) {
            this.right.query(left, right, bottom, result);
        }
    }
}

class PrioritySearchTreeEmptyNode {
    constructor() { }

    render(ctxt) {
        // empty nodes need to start a new path, otherwise wrong nodes get connected
        ctxt.beginPath();
    }

    query(left, right, bottom, result) {

    }
}
