import React, { Component } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import Cytoscape from "cytoscape";
import edgehandles from "cytoscape-edgehandles";
import popper from "cytoscape-popper";
import cyCanvas from "cytoscape-canvas";
import "./App.css";
import uuid from "./uuid";
Cytoscape.use(edgehandles);
Cytoscape.use(popper);
// Cytoscape.use(cyCanvas);
cyCanvas(Cytoscape);
export default class App extends Component {
  cy: any;

  //eh is for edge handling.i.e being able to add
  //edges when dragging from one node to another
  eh: any;
  singleExpressionGraph: any = {};
  expressionGraphs: any = [];
  state = {
    w: 0,
    h: 0,
    elements: [] = [
      {
        data: {
          type: "operand",
          id: uuid(),
          label: "workerType",
        },
        position: { x: 100, y: 100 },
      },
      {
        data: { type: "operand", id: uuid(), label: "workerType" },
        position: { x: 600, y: 100 },
      },
      {
        data: { type: "operand", id: uuid(), label: "country" },
        position: { x: 100, y: 200 },
      },
      {
        data: { type: "operand", id: uuid(), label: "country" },
        position: { x: 600, y: 200 },
      },
      // {
      //   data: { type: "operand", id: uuid(), label: "subCategory" },
      //   position: { x: 100, y: 300 },
      // },
      // {
      //   data: { type: "operand", id: uuid(), label: "subCategory" },
      //   position: { x: 600, y: 300 },
      // },
      // {
      //   data: { type: "operand", id: uuid(), label: "city" },
      //   position: { x: 100, y: 400 },
      // },
      // {
      //   data: { type: "operand", id: uuid(), label: "city" },
      //   position: { x: 600, y: 400 },
      // },
      // {
      //   data: { type: "operand", id: uuid(), label: "postalCode" },
      //   position: { x: 100, y: 500 },
      // },
      // {
      //   data: { type: "operand", id: uuid(), label: "postalCode" },
      //   position: { x: 600, y: 500 },
      // },
      // {
      //   data: { type: "operand", id: uuid(), label: "workHours" },
      //   position: { x: 100, y: 600 },
      // },
      // {
      //   data: { type: "operand", id: uuid(), label: "workHours" },
      //   position: { x: 600, y: 600 },
      // },
      // {
      //   data: { type: "operand", id: uuid(), label: "description" },
      //   position: { x: 100, y: 700 },
      // },
      // {
      //   data: { type: "operand", id: uuid(), label: "description" },
      //   position: { x: 600, y: 700 },
      // },
      // { data: { id: uuid(), label: "timeType" }, position: { x: 100, y: 200 } },
      // { data: { id: uuid(), label: "timeType" }, position: { x: 400, y: 200 } },
      // { data: { id: uuid(), label: "language" }, position: { x: 400, y: 200 } },
      // { data: { id: uuid(), label: "language" }, position: { x: 400, y: 200 } },
      // {
      //   data: {
      //     source: "one",
      //     target: "two",
      //     label: "Edge from Node1 to Node2",
      //   },
      // },
      // {
      //   data: {
      //     source: "three",
      //     target: "four",
      //     label: "Edge from Node3 to Node4",
      //   },
      // },
    ],
  };
  constructor(props: any) {
    super(props);
  }
  componentDidMount = () => {
    this.setState({
      w: window.innerWidth,
      h: window.innerHeight,
    });

    this.eh = this.cy.edgehandles();
    console.log("EDGE HANDLE======>", this.eh);
    console.log("DATATATATATA", this.cy.data());
    this.setUpListeners();
  };
  setUpListeners = () => {
    this.cy.on("click", "node", (event: any) => {
      let node = event.target;

      console.log("CLICKED NODE ", node.data().attribute);
      if (node.data().label === "Replace") {
        var attribute = prompt(
          "please enter the replace attribute",
          node.data().attribute
        );
        node.data().attribute = attribute;
      }
      console.log("DEGREEE", node.degree());
    });

    this.cy.on(
      "ehcomplete",
      (
        event: { position: any },
        sourceNode: any,
        targetNode: any,
        addedEles: any
      ) => {
        //CHECKING IF AN OPERATOR NODE'S OUTPUT PORT IS CONNECTED TO AN OPERAND NODE & IF THE OPERATOR
        //NODE HAS ONE OR MORE INCOMING CONNECTIONS FROM AN OPERAND NODE(S).i.e. An expression is complete
        if (
          (sourceNode._private.data.type === "operator" &&
            sourceNode.indegree() > 0) ||
          (targetNode._private.data.type === "operator" &&
            targetNode.outdegree() > 0)
        ) {
          console.log("EXPRESSION COMPLETE");
          let operatorNode =
            sourceNode._private.data.type === "operator"
              ? sourceNode
              : targetNode._private.data.type === "operator"
              ? targetNode
              : "";
          let inputNodes = operatorNode.incomers().filter((element: any) => {
            return element._private.group === "nodes";
          });
          let outputNodes = operatorNode.outgoers().filter((element: any) => {
            return element._private.group === "nodes";
          });

          // Filtering out nodes added by eh-handle extension
          let nodes = [...inputNodes, ...outputNodes, operatorNode]
            .filter((node) => {
              return !node._private.classes.has("eh-ghost");
            })
            .map((node: any) => node._private.data);

          // Filtering out edges added by eh-handle extension
          let edges = operatorNode
            .connectedEdges()
            .filter((edge: any) => {
              return edge._private.classes.size == 0;
            })
            .map((edge: any) => edge._private.data);

          console.log("edges in the expression =========> ", edges);
          console.log("nodes in the expression", nodes);
          this.singleExpressionGraph = { edges, nodes };
          console.log("expression graph=======>", this.singleExpressionGraph);
        }
        // console.log("PRESENT STATE OF THE CANVAS ", this.cy.elements().jsons());
      }
    );
  };

  // When an operator node is dragged from side panel to the canvas.
  //Creates a new node for the operator node.
  operatorDragged = (e: any) => {
    this.expressionGraphs.push(this.singleExpressionGraph);
    console.log("EXPRESSION GRAPHS=====>", this.expressionGraphs);
    e.dataTransfer.dropEffect = "move";
    let attribute;
    // e.dataTransfer.setData("text/name", e.target.innerHTML);
    switch (e.target.innerHTML) {
      case "Replace":
        attribute = prompt("Please enter the replace attribute");
        break;
      case "Concatenate":
        attribute = prompt(
          "Please mention the fields in the order you want them to concatenate in, followed by a space"
        );
    }
    let newOperatorNode = this.cy.add({
      group: "nodes",
      data: {
        id: uuid(),
        label: e.target.innerHTML,
        type: "operator",
        attribute: attribute,
      },
      position: { x: e.pageX - 200, y: e.pageY },
    });
    // console.log("REPLACE NODE===>", newOperatorNode);
  };

  render() {
    return (
      <div className="container">
        <div className="operator-drawer">
          <ul>
            <li draggable="true" onDragEnd={this.operatorDragged}>
              Replace
            </li>
            <li draggable="true" onDragEnd={this.operatorDragged}>
              Concatenate
            </li>
          </ul>
        </div>
        <div>
          <div>
            <CytoscapeComponent
              cy={(cy: any) => {
                this.cy = cy;
              }}
              elements={CytoscapeComponent.normalizeElements(
                this.state.elements
              )}
              style={{ width: this.state.w, height: this.state.h }}
              stylesheet={[
                {
                  selector: "node",
                  style: {
                    label: "data(label)",
                  },
                },
                {
                  selector: " node[type = 'operand']",
                  style: {
                    shape: "round-rectangle",
                    content: "data(label)",
                    width: "50px",
                    "background-color": "#b6d2e2",
                    "border-color": "#01b2c0",
                    "border-width": "2px",
                  },
                },
                {
                  selector: " node[type = 'operator']",
                  style: {
                    shape: "octagon",
                    "background-color": "blue",
                  },
                },
                {
                  selector: "edge",
                  style: {
                    "curve-style": "bezier",
                    "target-arrow-shape": "triangle",
                  },
                },
                {
                  selector: ".eh-handle",
                  style: {
                    "background-color": "red",
                    width: 12,
                    height: 12,
                    shape: "ellrecipse",
                    "overlay-opacity": 0,
                    "border-width": 12, // makes the handle easier to hit
                    "border-opacity": 0,
                  },
                },
                {
                  selector: ".eh-hover",
                  style: {
                    "background-color": "red",
                  },
                },
                {
                  selector: ".eh-source",
                  style: {
                    "border-width": 2,
                    "border-color": "red",
                  },
                },
                {
                  selector: ".eh-target",
                  style: {
                    "border-width": 2,
                    "border-color": "red",
                  },
                },
                {
                  selector: ".eh-preview, .eh-ghost-edge",
                  style: {
                    "background-color": "red",
                    "line-color": "red",
                    "target-arrow-color": "red",
                    "source-arrow-color": "red",
                    "target-arrow-shape": "triangle",
                  },
                },
                {
                  selector: ".eh-ghost-edge.eh-preview-active",
                  style: {
                    opacity: 0,
                  },
                },
              ]}
            />
          </div>
        </div>
      </div>
    );
  }
}
