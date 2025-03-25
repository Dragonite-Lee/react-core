import { syntheticEvent } from "./synthetic-event";
import { syntheticName } from "./synthetic-name";

// 일단 Renderer는 가상DOM을 실제DOM에 렌더링하는 역할
export class Renderer {
  container; // 렌더링 결과를 삽입할 실제 DOM요소 div#root
  currentRootComponent; // 현재 렌더링 중인 루트 컴포넌트 -> 리렌더링 할때 참조함
  currentElement; // 현재 렌더링된 가상 DOM요소
  /**
   * eventHandlerMap - WeakMap(dom, Map(eventName, syntheticEventHandler))
   */
  eventHandlerMap = new WeakMap();

  static hooks = []; // hooks상태들을 관리하기 위해 생성
  static currentHookIndex = 0; // 훅 호출할 인덱스 관리
  static instance; //싱글톤 패턴을 위해 생성
  /**
   * 싱글톤 패턴 -> 특정 클래스의 객체가 프로그램 전체에서 오직 하나만 존재하며, 어디서든 그 객체에 접근할 수 있도록 설계하는 법
   */

  constructor(container) {
    if (Renderer.instance) {
      return Renderer.instance;
    } // 싱글톤 패턴이라 인스턴스가 존재할 때 새로운 인스턴스가 들어오면 기존을 리턴

    if (!container) {
      throw new Error("루트가 존재하지 않습니다.");
    }
    // 인스턴스와 컨테이너 유효성 검사를 마친 후, 현재 container와 인스턴스에 각각 저장
    this.container = container;
    Renderer.instance = this;
  }

  // hooks배열과 현재 인덱스를 반환
  static getHooks() {
    return {
      hooks: Renderer.hooks,
      currentHookIndex: Renderer.currentHookIndex,
    };
  }

  // 훅 인덱스를 증가시켜 반환 -> useState나 useEffect를 호출 시 사용
  static incrementHookIndex() {
    return ++Renderer.currentHookIndex;
  }

  // 리렌더링시 훅 순서를 재조정하기 위해 0으로 리셋
  static resetHookIndex() {
    Renderer.currentHookIndex = 0;
  }

  // 리렌더링을 트리거하는 로직
  static forceUpdate() {
    // currentRootComponent가 없으면 종료시키고
    if (!Renderer.instance?.currentRootComponent) {
      return;
    }

    // 훅 순서를 재조정하기 위해 훅 인덱스 리셋 작업
    Renderer.resetHookIndex();
    // currentRootComponent를 호출해 새로운 가상 DOM요소 생성
    const rootElement = Renderer.instance.currentRootComponent();
    // 만들어낸 가상 DOM요소를 render함수를 이용하여 삽입 -> 리렌더링이라 rootComponent를 변경할 필요가 없으므로 가상dom인 element만 삽입
    Renderer.instance.render(rootElement);
  }

  render(element, rootComponent) {
    // 리렌더링할 땐 rootComponent를 변경할 필요가 없음 그리고 초기 렌더링 시 this.currentRootComponent가 이미 설정되어 있음
    if (rootComponent) {
      this.currentRootComponent = rootComponent;
    }

    // reconcile을 이용해 새로만든 가상돔인 element와 현재 돔인 currentElement를 조정함
    this.reconcile(this.currentElement, element, this.container);
    // 조정후 currentElement를 업데이트한 가상돔으로 갱신시키기
    this.currentElement = element;
  }

  createDomElement(element) {
    // 가상DOM을 실제DOM으로 변경하는 역할
    if (typeof element === "string" || typeof element === "number") {
      // 만약 element가 문자열이나 숫자면 텍스트 노드를 생성
      return document.createTextNode(element as string);
    }

    const {
      type,
      props: { children = [], ...props },
    } = element;

    const dom = document.createElement(type); // DOM을 생성해주고

    this.updateDOMChildren(dom, [], children); // 자식요소를 추가해주고
    this.updateDOMProperties(dom, {}, props); // 속성을 적용시켜준다.

    return dom;
  }

  reconcile(currentElement, updatedElement, container) {
    // initial rendering
    if (!this.currentElement) {
      // currentElement가 없으면 첫 렌더링이기에 받은 가상DOM을 실제DOM으로 적용하고 종료
      const dom = this.createDomElement(updatedElement);
      this.container.appendChild(dom);
      return;
    }

    // rerendering
    if (currentElement.type !== updatedElement.type) {
      // 타입이 다르면 새로 돔을 생성
      const dom = this.createDomElement(updatedElement);
      if (container.firstChild) {
        // 기존 요소가 있었다면 클린업하고 대체하기
        this.cleanupEventListener(container.firstChild);
        container.replaceChild(dom, container.firstChild);
      } else {
        // 그게 아니라면 돔을 추가함
        container.appendChild(dom);
      }
      return;
    }

    const dom = container.firstChild;

    const { children: currentChild, ...currentProps } =
      currentElement.props ?? {};
    const { children: updatedChild, ...updatedProps } =
      updatedElement.props ?? {};

    this.updateDOMChildren(dom, currentChild, updatedChild);
    this.updateDOMProperties(dom, currentProps, updatedProps);
  }

  /**
   * 가상 돔과 실제 돔, 업데이트 예정인 돔을 비교하여 DOM 요소를 업데이트합니다.
   *
   * @param {HTMLElement} dom
   * @param {Array|string|null|undefined} currentChild
   * @param {Array|string|null|undefined} updatedChild
   */
  updateDOMChildren(dom, currentChild, updatedChild) {
    if (Array.isArray(updatedChild)) {
      // updatedChild가 배열이면 currentChild을 배열로 변환해주고
      const currentChildList = Array.isArray(currentChild)
        ? currentChild
        : [currentChild];

      // child가 null이나 undefined가 아닐 경우의 자식 요소 인덱스
      let validChildIndex = 0;

      for (let i = 0; i < updatedChild.length; i++) {
        // updatedChild를 순회하며
        const child = updatedChild[i];

        if (child == null) {
          continue;
        }

        if (currentChildList.length > i) {
          // 가상돔 자식 요소와 업데이트 중인 자식 요소 비교가 가능한 경우
          if (dom.childNodes.length > validChildIndex) {
            // 실제 돔의 자식 요소와 업데이트 중인 요소를 비교
            this.reconcile(currentChildList[i], child, {
              firstChild: dom.childNodes[validChildIndex],
              appendChild: (node) => dom.appendChild(node),
              replaceChild: (newChild, oldChild) =>
                dom.replaceChild(newChild, oldChild),
            });
          } else {
            // 실제 돔의 자식 요소가 존재하지 않을 경우 업데이트 중인 요소 추가
            const childDom = this.createDomElement(child);
            dom.appendChild(childDom);
          }
        } else {
          // 업데이트 중인 요소가 더 긴 경우
          const childDom = this.createDomElement(child);
          dom.appendChild(childDom);
        }

        validChildIndex += 1;
      }

      // 실제 돔의 자식요소가 더 많을 경우 삭제
      while (dom && dom.childNodes.length > validChildIndex) {
        dom.removeChild(dom.lastChild);
      }
    } else {
      // updatedChild가 배열이 아닌 경우 (TEXT_NODE, null, undefined)
      if (updatedChild !== currentChild) {
        dom.textContent = updatedChild;
      }
    }
  }

  /**
   * 현재 props를 제거하고 업데이트 예정인 props를 DOM 요소에 적용합니다.
   *
   * @param {HTMLElement} dom
   * @param {object} currentProps 속성 및 이벤트 객체
   * @param {object} updatedProps 속성 및 이벶트 객체
   */
  updateDOMProperties(dom, currentProps, updatedProps) {
    Object.entries(currentProps).forEach(([propName, value]) => {
      if (typeof value === "function") {
        this.removeEventListener(dom, propName);
      } else {
        dom.removeAttribute(propName);
      }
    });

    Object.entries(updatedProps).forEach(([propName, value]) => {
      if (typeof value === "function") {
        this.addEventListener(dom, propName, value);
      } else {
        dom.setAttribute(propName, value);
      }
    });
  }

  /**
   * DOM 요소를 순회하면서 eventHandlerMap에 등록된 이벤트 리스너를 제거합니다.
   *
   * @param {HTMLElement} dom
   */
  cleanupEventListener(dom) {
    if (this.eventHandlerMap.has(dom)) {
      const domEvents = this.eventHandlerMap.get(dom);

      domEvents.forEach((syntheticEventHandler, eventName) => {
        const syntheticEventName = syntheticName(dom, eventName);
        dom.removeEventListener(syntheticEventName, syntheticEventHandler);
      });

      this.eventHandlerMap.delete(dom);
    }

    for (let i = 0; i < dom.childNodes.length; i++) {
      this.cleanupEventListener(dom.childNodes[i]);
    }
  }

  /**
   * DOM 요소에 합성 이벤트(synthetic event)를 등록하고 eventHandlerMap으로 이벤트 참조를 관리합니다.
   *
   * @param {HTMLElement} dom 이벤트 리스너를 추가할 DOM 요소
   * @param {string} eventName onClick과 같은 이벤트명을 전달받습니다.
   * @param {Function} reactEvent 리액트에 등록된 이벤트를 전달받습니다.
   */
  addEventListener(dom, eventName, reactEvent) {
    if (!this.eventHandlerMap.has(dom)) {
      this.eventHandlerMap.set(dom, new Map());
    }

    const domEvents = this.eventHandlerMap.get(dom);

    if (domEvents.has(eventName)) {
      return;
    }

    const syntheticEventName = syntheticName(dom, eventName);
    const syntheticEventHandler = syntheticEvent(reactEvent);

    domEvents.set(eventName, syntheticEventHandler);
    dom.addEventListener(syntheticEventName, syntheticEventHandler);
  }

  /**
   * eventHandlerMap을 활용하여 DOM 요소에 등록된 합성 이벤트(synthetic event)를 제거합니다.
   *
   * @param {HTMLElement} dom 이벤트 리스너를 제거할 DOM 요소
   * @param {string} eventName onClick과 같은 이벤트명을 전달받습니다.
   */
  removeEventListener(dom, eventName) {
    const domEvents = this.eventHandlerMap.get(dom);

    if (!domEvents || !domEvents.has(eventName)) {
      return;
    }

    const syntheticEventName = syntheticName(dom, eventName);
    const syntheticEventHandler = domEvents.get(eventName);

    domEvents.delete(eventName);
    dom.removeEventListener(syntheticEventName, syntheticEventHandler);

    if (!domEvents.size) {
      this.eventHandlerMap.delete(dom);
    }
  }
}
