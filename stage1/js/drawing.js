// drawing.js - Drawing Engine (immediate color change, better eraser, undo)

class DrawingEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'pen';
        this.currentColor = '#000000';
        this.currentWidth = 3;
        this.strokes = [];
        this.textObjects = [];
        this.currentStroke = [];
        this.undoStack = [];
        // Set canvas size
        this.canvas.width = 1200;
        this.canvas.height = 600;
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseout', () => this.handleMouseUp());
    }
    handleMouseDown(e) {
        this.isDrawing = true;
        const point = this.getMousePos(e);
        if (this.currentTool === 'text') {
            this.addText(point);
            return;
        }
        this.currentStroke = [{...point, color: this.currentColor, width: this.currentWidth}];
        this.ctx.beginPath();
        this.ctx.moveTo(point.x, point.y);
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }
    handleMouseMove(e) {
        if (!this.isDrawing || this.currentTool === 'text') return;
        const point = this.getMousePos(e);
        this.currentStroke.push({...point, color: this.currentColor, width: this.currentWidth});
        if (this.currentTool === 'eraser') {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'destination-out'; // Paint with transparency (like a real eraser)
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, this.currentWidth * 2, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.restore();
        } else {
            this.ctx.lineTo(point.x, point.y);
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.lineWidth = this.currentWidth;
            this.ctx.stroke();
        }
    }
    handleMouseUp() {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        if (this.currentTool === 'text') return;
        if (this.currentStroke.length > 1) {
            if (this.currentTool === 'eraser') {
                // redraw after painting eraser holes
                this.saveUndo();
            } else {
                // Save stroke to undo stack too
                this.strokes.push({
                    id: Utils.generateUUID(),
                    type: this.currentTool,
                    points: this.currentStroke,
                    color: this.currentColor,
                    width: this.currentWidth,
                    timestamp: Date.now()
                });
                this.saveUndo();
            }
        }
        this.currentStroke = [];
    }
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    setTool(tool) {
        this.currentTool = tool;
        if (tool === 'eraser') {
            this.canvas.style.cursor = 'cell';
        } else if (tool === 'text') {
            this.canvas.style.cursor = 'text';
        } else {
            this.canvas.style.cursor = 'crosshair';
        }
    }
    setColor(color) {
        this.currentColor = color;
    }
    setWidth(width) {
        this.currentWidth = width;
    }
    addText(point) {
        const text = prompt('Enter text:');
        if (!text) return;
        const textObj = {
            id: Utils.generateUUID(),
            content: text,
            x: point.x,
            y: point.y,
            color: this.currentColor,
            fontSize: 16,
            timestamp: Date.now()
        };
        this.textObjects.push(textObj);
        this.saveUndo();
        this.renderText(textObj);
    }
    renderText(textObj) {
        this.ctx.font = `${textObj.fontSize}px Arial`;
        this.ctx.fillStyle = textObj.color;
        this.ctx.fillText(textObj.content, textObj.x, textObj.y);
    }
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveUndo();
        this.strokes = [];
        this.textObjects = [];
    }
    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.strokes.forEach(stroke => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = stroke.color;
            this.ctx.lineWidth = stroke.width;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            if (stroke.points.length > 0) {
                this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
                for (let i = 1; i < stroke.points.length; i++) {
                    this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
                }
                this.ctx.stroke();
            }
        });
        this.textObjects.forEach(textObj => {
            this.renderText(textObj);
        });
    }
    saveUndo() {
        this.undoStack.push({
            strokes: JSON.parse(JSON.stringify(this.strokes)),
            textObjects: JSON.parse(JSON.stringify(this.textObjects))
        });
        if (this.undoStack.length > 40) this.undoStack.shift();
    }
    undo() {
        if (this.undoStack.length > 1) {
            this.undoStack.pop();
            const prevState = this.undoStack[this.undoStack.length - 1];
            this.strokes = JSON.parse(JSON.stringify(prevState.strokes));
            this.textObjects = JSON.parse(JSON.stringify(prevState.textObjects));
            this.redrawCanvas();
        }
    }
    getCanvasState() {
        return {
            strokes: this.strokes,
            textObjects: this.textObjects
        };
    }
    loadCanvasState(state) {
        this.strokes = state.strokes || [];
        this.textObjects = state.textObjects || [];
        this.redrawCanvas();
        this.saveUndo();
    }
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DrawingEngine;
}
