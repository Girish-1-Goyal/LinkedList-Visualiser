class Node:
    def __init__(self, value):
        self.value = value
        self.next = None
        self.prev = None

class SinglyLinkedList:
    def __init__(self):
        self.head = None
    
    def append(self, value):
        new_node = Node(value)
        if not self.head:
            self.head = new_node
            return
        
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node
    
    def get_nodes(self):
        nodes = []
        current = self.head
        while current:
            nodes.append({
                "value": current.value,
                "next": current.next.value if current.next else None
            })
            current = current.next
        return nodes

class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None
    
    def append(self, value):
        new_node = Node(value)
        if not self.head:
            self.head = new_node
            self.tail = new_node
            return
        
        new_node.prev = self.tail
        self.tail.next = new_node
        self.tail = new_node
    
    def get_nodes(self):
        nodes = []
        current = self.head
        while current:
            nodes.append({
                "value": current.value,
                "next": current.next.value if current.next else None,
                "prev": current.prev.value if current.prev else None
            })
            current = current.next
        return nodes

class CircularLinkedList:
    def __init__(self):
        self.head = None
    
    def append(self, value):
        new_node = Node(value)
        if not self.head:
            self.head = new_node
            new_node.next = new_node
            return
        
        current = self.head
        while current.next != self.head:
            current = current.next
        current.next = new_node
        new_node.next = self.head
    
    def get_nodes(self):
        if not self.head:
            return []
        
        nodes = []
        current = self.head
        while True:
            nodes.append({
                "value": current.value,
                "next": current.next.value
            })
            current = current.next
            if current == self.head:
                break
        return nodes 