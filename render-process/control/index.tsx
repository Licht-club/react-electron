import ReactDom from "react-dom";
import React, {useEffect} from "react";
import DesktopCapturerVideo from "./DesktopCapturerVideo";


function App(){

    return <div>
        <span>模拟远程控制台</span>
        <DesktopCapturerVideo />
    </div>
}

ReactDom.render(<App></App>, document.getElementById('root'))