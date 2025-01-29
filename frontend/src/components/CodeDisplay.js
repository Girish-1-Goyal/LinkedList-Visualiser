import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import '../styles/CodeDisplay.css';

const CodeDisplay = ({ listType, language, operation }) => {
  useEffect(() => {
    if (Prism) {
      Prism.highlightAll();
    }
  }, [listType, language, operation]);

  const getCppCode = () => {
    const baseCode = `
class Node {
    int data;
    Node* next;
    ${listType === 'doubly' ? 'Node* prev;' : ''}
public:
    Node(int value) : data(value), next(nullptr) ${listType === 'doubly' ? ', prev(nullptr)' : ''} {}
};

class LinkedList {
    Node* head;
    ${listType === 'doubly' ? 'Node* tail;' : ''}
public:
    LinkedList() : head(nullptr) ${listType === 'doubly' ? ', tail(nullptr)' : ''} {}
`;

    const operations = {
      'insert_start': `
    void insertFront(int value) {
        Node* newNode = new Node(value);
        newNode->next = head;
        ${listType === 'doubly' ? 'if(head) head->prev = newNode;' : ''}
        head = newNode;
        ${listType === 'doubly' ? 'if(!tail) tail = newNode;' : ''}
        ${listType === 'circular' ? 'if(!head->next) head->next = head;' : ''}
    }`,
      'insert_end': `
    void insertEnd(int value) {
        Node* newNode = new Node(value);
        if (!head) {
            head = newNode;
            ${listType === 'doubly' ? 'tail = newNode;' : ''}
            ${listType === 'circular' ? 'head->next = head;' : ''}
            return;
        }
        ${listType === 'doubly' ? 
        `tail->next = newNode;
        newNode->prev = tail;
        tail = newNode;
        ${listType === 'circular' ? 'tail->next = head;' : ''}` :
        `Node* temp = head;
        while (temp->next ${listType === 'circular' ? '!= head' : '!= nullptr'}) {
            temp = temp->next;
        }
        temp->next = newNode;
        ${listType === 'circular' ? 'newNode->next = head;' : ''}`}
    }`,
      'insert_at': `
    void insertAt(int value, int position) {
        if (position < 0) return;
        if (position == 0) {
            insertFront(value);
            return;
        }

        Node* newNode = new Node(value);
        Node* current = head;
        for (int i = 0; i < position - 1 && current; i++) {
            current = current->next;
        }
        
        if (!current) return;
        
        newNode->next = current->next;
        ${listType === 'doubly' ? 'if(current->next) current->next->prev = newNode;' : ''}
        current->next = newNode;
        ${listType === 'doubly' ? 'newNode->prev = current;' : ''}
        ${listType === 'doubly' ? 'if(!newNode->next) tail = newNode;' : ''}
    }`,
      'delete_start': `
    void deleteFront() {
        if (!head) return;
        
        Node* temp = head;
        head = head->next;
        ${listType === 'doubly' ? 'if(head) head->prev = nullptr;' : ''}
        ${listType === 'doubly' ? 'if(!head) tail = nullptr;' : ''}
        ${listType === 'circular' ? 'if(head == temp) head = nullptr;' : ''}
        delete temp;
    }`,
      'delete_end': `
    void deleteEnd() {
        if (!head) return;
        if (!head->next) {
            delete head;
            head = nullptr;
            ${listType === 'doubly' ? 'tail = nullptr;' : ''}
            return;
        }

        ${listType === 'doubly' ? 
        `Node* temp = tail;
        tail = tail->prev;
        tail->next = ${listType === 'circular' ? 'head' : 'nullptr'};
        delete temp;` :
        `Node* current = head;
        while (current->next->next ${listType === 'circular' ? '!= head' : '!= nullptr'}) {
            current = current->next;
        }
        delete current->next;
        current->next = ${listType === 'circular' ? 'head' : 'nullptr'};`}
    }`,
      'delete_at': `
    void deleteAt(int position) {
        if (!head || position < 0) return;
        if (position == 0) {
            deleteFront();
            return;
        }

        Node* current = head;
        for (int i = 0; i < position - 1 && current->next; i++) {
            current = current->next;
        }

        if (!current->next) return;
        
        Node* temp = current->next;
        current->next = temp->next;
        ${listType === 'doubly' ? 'if(temp->next) temp->next->prev = current;' : ''}
        ${listType === 'doubly' ? 'if(temp == tail) tail = current;' : ''}
        delete temp;
    }`,
      'search': `
    Node* search(int value) {
        Node* current = head;
        while (current ${listType === 'circular' ? '&& (current->next != head || current == head)' : '!= nullptr'}) {
            if (current->data == value) return current;
            current = current->next;
        }
        return nullptr;
    }`
    };

    const endCode = `
};`;

    // If no operation is selected or it's 'no_operation', show all operations
    if (!operation || operation === 'no_operation') {
      const allOperations = Object.values(operations).join('\n');
      return baseCode + allOperations + endCode;
    }

    // Show only the selected operation
    const selectedOperation = operations[operation] || '';
    const code = baseCode + selectedOperation + endCode;
    
    return code;
  };

  const getPythonCode = () => {
    const baseCode = `
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None
        ${listType === 'doubly' ? 'self.prev = None' : ''}

class LinkedList:
    def __init__(self):
        self.head = None
        ${listType === 'doubly' ? 'self.tail = None' : ''}
`;

    const operations = {
      'insert_start': `
    def insert_front(self, value):
        new_node = Node(value)
        new_node.next = self.head
        ${listType === 'doubly' ? 'if self.head:\n            self.head.prev = new_node' : ''}
        self.head = new_node
        ${listType === 'doubly' ? 'if not self.tail:\n            self.tail = new_node' : ''}
        ${listType === 'circular' ? 'if not new_node.next:\n            new_node.next = new_node' : ''}`,

      'insert_end': `
    def insert_end(self, value):
        new_node = Node(value)
        if not self.head:
            self.head = new_node
            ${listType === 'doubly' ? 'self.tail = new_node' : ''}
            ${listType === 'circular' ? 'new_node.next = new_node' : ''}
            return
        
        ${listType === 'doubly' ? 
        `self.tail.next = new_node
        new_node.prev = self.tail
        self.tail = new_node
        ${listType === 'circular' ? 'new_node.next = self.head' : ''}` :
        `temp = self.head
        while temp.next ${listType === 'circular' ? '!= self.head' : 'is not None'}:
            temp = temp.next
        temp.next = new_node
        ${listType === 'circular' ? 'new_node.next = self.head' : ''}`}`,

      'insert_at': `
    def insert_at(self, value, position):
        if position < 0:
            return
        if position == 0:
            self.insert_front(value)
            return

        new_node = Node(value)
        current = self.head
        for i in range(position - 1):
            if not current:
                return
            current = current.next
        
        if not current:
            return
        
        new_node.next = current.next
        ${listType === 'doubly' ? 'if current.next:\n            current.next.prev = new_node' : ''}
        current.next = new_node
        ${listType === 'doubly' ? 'new_node.prev = current' : ''}
        ${listType === 'doubly' ? 'if not new_node.next:\n            self.tail = new_node' : ''}`,

      'delete_start': `
    def delete_front(self):
        if not self.head:
            return
        
        temp = self.head
        self.head = self.head.next
        ${listType === 'doubly' ? 'if self.head:\n            self.head.prev = None' : ''}
        ${listType === 'doubly' ? 'if not self.head:\n            self.tail = None' : ''}
        ${listType === 'circular' ? 'if self.head == temp:\n            self.head = None' : ''}
        del temp`,

      'delete_end': `
    def delete_end(self):
        if not self.head:
            return
        if not self.head.next:
            self.head = None
            ${listType === 'doubly' ? 'self.tail = None' : ''}
            return

        ${listType === 'doubly' ? 
        `temp = self.tail
        self.tail = self.tail.prev
        self.tail.next = ${listType === 'circular' ? 'self.head' : 'None'}
        del temp` :
        `current = self.head
        while current.next.next ${listType === 'circular' ? '!= self.head' : 'is not None'}:
            current = current.next
        del current.next
        current.next = ${listType === 'circular' ? 'self.head' : 'None'}`}`,

      'delete_at': `
    def delete_at(self, position):
        if not self.head or position < 0:
            return
        if position == 0:
            self.delete_front()
            return

        current = self.head
        for i in range(position - 1):
            if not current.next:
                return
            current = current.next

        if not current.next:
            return
        
        temp = current.next
        current.next = temp.next
        ${listType === 'doubly' ? 'if temp.next:\n            temp.next.prev = current' : ''}
        ${listType === 'doubly' ? 'if temp == self.tail:\n            self.tail = current' : ''}
        del temp`,

      'search': `
    def search(self, value):
        current = self.head
        while current ${listType === 'circular' ? 'and (current.next != self.head or current == self.head)' : 'is not None'}:
            if current.data == value:
                return current
            current = current.next
        return None`
    };

    const endCode = ``;

    // If no operation is selected or it's 'no_operation', show all operations
    if (!operation || operation === 'no_operation') {
      const allOperations = Object.values(operations).join('\n');
      return baseCode + allOperations + endCode;
    }

    // Show only the selected operation
    const selectedOperation = operations[operation] || '';
    const code = baseCode + selectedOperation + endCode;
    
    return code;
  };

  const getJavaCode = () => {
    const baseCode = `
public class Node {
    private int data;
    private Node next;
    ${listType === 'doubly' ? 'private Node prev;' : ''}
    
    public Node(int data) {
        this.data = data;
        this.next = null;
        ${listType === 'doubly' ? 'this.prev = null;' : ''}
    }
}

public class LinkedList {
    private Node head;
    ${listType === 'doubly' ? 'private Node tail;' : ''}
    
    public LinkedList() {
        this.head = null;
        ${listType === 'doubly' ? 'this.tail = null;' : ''}
    }
`;

    const operations = {
      'insert_start': `
    public void insertFront(int value) {
        Node newNode = new Node(value);
        newNode.next = head;
        ${listType === 'doubly' ? 'if(head != null) head.prev = newNode;' : ''}
        head = newNode;
        ${listType === 'doubly' ? 'if(tail == null) tail = newNode;' : ''}
        ${listType === 'circular' ? 'if(newNode.next == null) newNode.next = newNode;' : ''}
    }`,

      'insert_end': `
    public void insertEnd(int value) {
        Node newNode = new Node(value);
        if (head == null) {
            head = newNode;
            ${listType === 'doubly' ? 'tail = newNode;' : ''}
            ${listType === 'circular' ? 'newNode.next = newNode;' : ''}
            return;
        }
        ${listType === 'doubly' ? 
        `tail.next = newNode;
        newNode.prev = tail;
        tail = newNode;
        ${listType === 'circular' ? 'newNode.next = head;' : ''}` :
        `Node temp = head;
        while (temp.next ${listType === 'circular' ? '!= head' : '!= null'}) {
            temp = temp.next;
        }
        temp.next = newNode;
        ${listType === 'circular' ? 'newNode.next = head;' : ''}`}
    }`,

      'insert_at': `
    public void insertAt(int value, int position) {
        if (position < 0) return;
        if (position == 0) {
            insertFront(value);
            return;
        }

        Node newNode = new Node(value);
        Node current = head;
        for (int i = 0; i < position - 1 && current != null; i++) {
            current = current.next;
        }
        
        if (current == null) return;
        
        newNode.next = current.next;
        ${listType === 'doubly' ? 'if(current.next != null) current.next.prev = newNode;' : ''}
        current.next = newNode;
        ${listType === 'doubly' ? 'newNode.prev = current;' : ''}
        ${listType === 'doubly' ? 'if(newNode.next == null) tail = newNode;' : ''}
    }`,

      'delete_start': `
    public void deleteFront() {
        if (!head) return;
        
        Node temp = head;
        head = head.next;
        ${listType === 'doubly' ? 'if(head != null) head.prev = null;' : ''}
        ${listType === 'doubly' ? 'if(tail == null) tail = null;' : ''}
        ${listType === 'circular' ? 'if(head == temp) head = null;' : ''}
        delete temp;
    }`,

      'delete_end': `
    public void deleteEnd() {
        if (!head) return;
        if (!head.next) {
            delete head;
            head = null;
            ${listType === 'doubly' ? 'tail = null;' : ''}
            return;
        }

        ${listType === 'doubly' ? 
        `Node temp = tail;
        tail = tail.prev;
        tail.next = ${listType === 'circular' ? 'head' : 'null'};
        delete temp` :
        `Node current = head;
        while (current.next.next ${listType === 'circular' ? '!= head' : '!= null'}) {
            current = current.next;
        }
        delete current.next;
        current.next = ${listType === 'circular' ? 'head' : 'null'};`}
    }`,

      'delete_at': `
    public void deleteAt(int position) {
        if (!head || position < 0) return;
        if (position == 0) {
            deleteFront();
            return;
        }

        Node current = head;
        for (int i = 0; i < position - 1 && current.next != null; i++) {
            current = current.next;
        }

        if (current.next == null) return;
        
        Node temp = current.next;
        current.next = temp.next;
        ${listType === 'doubly' ? 'if(temp.next != null) temp.next.prev = current;' : ''}
        ${listType === 'doubly' ? 'if(temp == tail) tail = current;' : ''}
        delete temp;
    }`,

      'search': `
    public Node search(int value) {
        Node current = head;
        while (current ${listType === 'circular' ? '!= null && (current.next != head || current == head)' : '!= null'}) {
            if (current.data == value) return current;
            current = current.next;
        }
        return null;
    }`
    };

    const endCode = `
}`;

    return generateCode(baseCode, operations, endCode);
  };

  const getJavaScriptCode = () => {
    const baseCode = `
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
        ${listType === 'doubly' ? 'this.prev = null;' : ''}
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        ${listType === 'doubly' ? 'this.tail = null;' : ''}
    }
`;

    const operations = {
      'insert_start': `
    insertFront(value) {
        const newNode = new Node(value);
        newNode.next = this.head;
        ${listType === 'doubly' ? 'if(this.head) this.head.prev = newNode;' : ''}
        this.head = newNode;
        ${listType === 'doubly' ? 'if(!this.tail) this.tail = newNode;' : ''}
        ${listType === 'circular' ? 'if(!newNode.next) newNode.next = newNode;' : ''}
    }`,

      'insert_end': `
    insertEnd(value) {
        const newNode = new Node(value);
        if (!this.head) {
            this.head = newNode;
            ${listType === 'doubly' ? 'this.tail = newNode;' : ''}
            ${listType === 'circular' ? 'newNode.next = newNode;' : ''}
            return;
        }
        ${listType === 'doubly' ? 
        `this.tail.next = newNode;
        newNode.prev = this.tail;
        this.tail = newNode;
        ${listType === 'circular' ? 'newNode.next = this.head;' : ''}` :
        `let temp = this.head;
        while (temp.next ${listType === 'circular' ? '!== this.head' : '!== null'}) {
            temp = temp.next;
        }
        temp.next = newNode;
        ${listType === 'circular' ? 'newNode.next = this.head;' : ''}`}
    }`,

      'insert_at': `
    insertAt(value, position) {
        if (position < 0) return;
        if (position == 0) {
            this.insertFront(value);
            return;
        }

        const newNode = new Node(value);
        let current = this.head;
        for (let i = 0; i < position - 1 && current; i++) {
            current = current.next;
        }
        
        if (!current) return;
        
        newNode.next = current.next;
        ${listType === 'doubly' ? 'if(current.next) current.next.prev = newNode;' : ''}
        current.next = newNode;
        ${listType === 'doubly' ? 'newNode.prev = current;' : ''}
        ${listType === 'doubly' ? 'if(!newNode.next) this.tail = newNode;' : ''}
    }`,

      'delete_start': `
    deleteFront() {
        if (!this.head) return;
        
        const temp = this.head;
        this.head = this.head.next;
        ${listType === 'doubly' ? 'if(this.head) this.head.prev = null;' : ''}
        ${listType === 'doubly' ? 'if(!this.head) this.tail = null;' : ''}
        ${listType === 'circular' ? 'if(this.head == temp) this.head = null;' : ''}
        delete temp;
    }`,

      'delete_end': `
    deleteEnd() {
        if (!this.head) return;
        if (!this.head.next) {
            delete this.head;
            this.head = null;
            ${listType === 'doubly' ? 'this.tail = null;' : ''}
            return;
        }

        ${listType === 'doubly' ? 
        `const temp = this.tail;
        this.tail = this.tail.prev;
        this.tail.next = ${listType === 'circular' ? 'this.head' : 'null'};
        delete temp` :
        `let current = this.head;
        while (current.next.next ${listType === 'circular' ? '!== this.head' : '!== null'}) {
            current = current.next;
        }
        delete current.next;
        current.next = ${listType === 'circular' ? 'this.head' : 'null'};`}
    }`,

      'delete_at': `
    deleteAt(position) {
        if (!this.head || position < 0) return;
        if (position == 0) {
            this.deleteFront();
            return;
        }

        let current = this.head;
        for (let i = 0; i < position - 1 && current.next; i++) {
            current = current.next;
        }

        if (!current.next) return;
        
        const temp = current.next;
        current.next = temp.next;
        ${listType === 'doubly' ? 'if(temp.next) temp.next.prev = current;' : ''}
        ${listType === 'doubly' ? 'if(temp == this.tail) this.tail = current;' : ''}
        delete temp;
    }`,

      'search': `
    search(value) {
        let current = this.head;
        while (current ${listType === 'circular' ? '!= null && (current.next != this.head || current == this.head)' : '!= null'}) {
            if (current.data == value) return current;
            current = current.next;
        }
        return null;
    }`
    };

    const endCode = `
}`;

    return generateCode(baseCode, operations, endCode);
  };

  const generateCode = (baseCode, operations, endCode) => {
    if (!operation || operation === 'no_operation') {
      const allOperations = Object.values(operations).join('\n');
      return baseCode + allOperations + endCode;
    }

    const selectedOperation = operations[operation] || '';
    return baseCode + selectedOperation + endCode;
  };

  const getCode = () => {
    if (language === 'cpp') {
      return getCppCode(listType);
    }
    return getPythonCode(listType);
  };

  const getOperationCode = (operation, value, position = null) => {
    switch (operation) {
      case 'insert_start':
        return `list.insertFront(${value});`;
      case 'insert_end':
        return `list.insertEnd(${value});`;
      case 'insert_at':
        return `list.insertAt(${value}, ${position});`;
      case 'delete_start':
        return `list.deleteFront();`;
      case 'delete_end':
        return `list.deleteEnd();`;
      case 'delete_at':
        return `list.deleteAt(${position});`;
      case 'search':
        return `list.search(${value});`;
      default:
        return '';
    }
  };

  return (
    <pre className="code-block">
      <code 
        className={`language-${language}`}
        dangerouslySetInnerHTML={{ 
          __html: Prism.highlight(
            (() => {
              switch(language) {
                case 'cpp': return getCppCode();
                case 'python': return getPythonCode();
                case 'java': return getJavaCode();
                case 'javascript': return getJavaScriptCode();
                default: return getCppCode();
              }
            })(),
            Prism.languages[language],
            language
          )
        }}
      />
    </pre>
  );
};

export default CodeDisplay; 