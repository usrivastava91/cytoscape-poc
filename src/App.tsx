import React, { Component } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import Cytoscape from "cytoscape";
import edgehandles from "cytoscape-edgehandles";
import popper from "cytoscape-popper";
import cyCanvas from "cytoscape-canvas";
import "./App.css";
Cytoscape.use(edgehandles);
Cytoscape.use(popper);
// Cytoscape.use(cyCanvas);
cyCanvas(Cytoscape);
export default class App extends Component {
  cy: any;

  //eh is for edge handling.i.e being able to add
  //edges when dragging from one node to another
  eh: any;

  // popper: any;
  // popperRef: any;
  state = {
    w: 0,
    h: 0,
    // elements: [],
    elements: [] = [
      {
        data: { id: "one", label: "Node 1", attribute: "extra attributes" },
        position: { x: 101, y: 200 },
      },
      { data: { id: "two", label: "Node 2" }, position: { x: 150, y: 200 } },
      { data: { id: "three", label: "Node 3" }, position: { x: 270, y: 200 } },
      { data: { id: "four", label: "Node 4" }, position: { x: 400, y: 200 } },
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
    // this.setState({
    //   elements:
    // })
    this.eh = this.cy.edgehandles();

    // this.popper = this.cy.nodes()[0].popper({
    //   content: () => {
    //     let div = document.createElement("div");

    //     div.innerHTML = "Popper content";

    //     document.body.appendChild(div);

    //     return div;
    //   },
    //   renderedPosition: () => ({ x: 100, y: 200 }),
    //   popper: {}, // my popper options here
    // });
    // let popperRef1 = this.cy.nodes()[0].popperRef();
    console.log("EDGE HANDLE======>", this.eh);
    console.log("DATATATATATA", this.cy.data());
    this.setUpListeners();
  };
  setUpListeners = () => {
    this.cy.on("click", "node", (event: any) => {
      console.log("CLICKED NODE ", event.target);
      console.log("DATATATATATA", this.cy.data());
    });

    this.cy.on(
      "ehcomplete",
      (
        event: { position: any },
        sourceNode: any,
        targetNode: any,
        addedEles: any
      ) => {
        let { position } = event;
        console.log(
          "EDGE COMPLETE =====>",
          sourceNode._private.data,
          targetNode
        );
        console.log("PRESENT STATE OF THE CANVAS ", this.cy.elements().jsons());
        // localStorage.setItem("stateOfCanvas", this.cy.elements().json);
      }
    );
  };

  // When an operator node is dragged from side panel to the canvas.
  //Creates a new node for the operator node.
  operatorDragged = (e: any) => {
    // let replaceOpID = 1;
    e.dataTransfer.dropEffect = "move";
    console.log(e.target.lastChild.value);
    console.log(e.target.firstChild.innerHTML);

    e.dataTransfer.setData("text/name", e.target.firstChild.innerHTML);
    console.log(e.pageX);
    let newOperatorNode = this.cy.add({
      group: "nodes",
      data: {
        weight: 75,
        label: e.target.firstChild.innerHTML,
        attribute: e.target.lastChild.value,
      },
      position: { x: e.pageX - 100, y: e.pageY },
    });

    console.log("REPLACE NODE===>", newOperatorNode);
    //drawing canvas to customise operator nodes' UI
    var layer = this.cy.cyCanvas();
    var canvas = layer.getCanvas();
    var ctx = canvas.getContext("2d");
    layer.resetTransform(ctx);
    layer.clear(ctx);
    layer.setTransform(ctx);
    // Draw model elements
    var pos = newOperatorNode.position();
    ctx.fillRect(pos.x - 20, pos.y - 20, 60, 30); // At node position
  };

  // dragover_handler = (e: any) => {
  //   e.preventDefault();
  //   e.dataTransfer.dropEffect = "move";
  //   console.log("dragover_handler", e);
  // };

  // drop_handler = (e: any) => {
  //   e.preventDefault();
  //   // Get the id of the target and add the moved element to the target's DOM
  //   const data = e.dataTransfer.getData("text/name");
  //   console.log("drop_handler", data);
  // };
  render() {
    return (
      <div className="container">
        <div className="operator-drawer">
          <ul>
            <li draggable="true" onDragEnd={this.operatorDragged}>
              <label htmlFor="replaceAttribute">Replace</label>
              <input type="text" id="replaceAttribute" />
            </li>
            <li>concatenate</li>
          </ul>
        </div>
        <div>
          <div>
            <CytoscapeComponent
              cy={(cy: any) => {
                this.cy = cy;
              }}
              elements={this.state.elements}
              style={{ width: this.state.w, height: this.state.h }}
            />
          </div>
        </div>
      </div>
    );
  }
}
