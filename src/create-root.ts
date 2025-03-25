import { Renderer } from "./render";

export function createRoot(container) {
    // container는 렌더링 결과를 삽입할 위치 div#root

    // Renderer인스턴스를 생성해서 container를 전달
    const renderer = new Renderer(container);

    return {
      render: (component) => {
        //component를 받아서 특정 작업을 할건데, 우선 function인지 판단
        if (typeof component !== "function") {
          throw new Error("루트 함수를 전달해주요.");
        }
  
        // component를 호출해 가상 DOM요소를 생성하고
        const element = component();
  
        // 생성된 가상돔 component를 element에 삽입
        renderer.render(element, component);
      },
    };
  }
