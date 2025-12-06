
// Interface untuk node umum
interface LexicalNode {
    type: string;
    children?: LexicalNode[];
    src?: string;
    altText?: string;
    caption?: string;
}

// Interface untuk root node
interface LexicalRoot {
    children?: LexicalNode[];
}

// Interface untuk editor state
interface LexicalEditorState {
    root?: LexicalRoot;
}

// Interface untuk hasil ekstraksi gambar
interface ExtractedImage {
    src: string;
    altText: string;
    caption: string;
}

export function extractImagesFromLexical(editorState: LexicalEditorState): ExtractedImage[] {
    const images: ExtractedImage[] = [];

    function traverseNodes(nodes: LexicalNode[]): void {
        nodes.forEach(node => {
            if (node.type === "image" && node.src) {
                images.push({
                    src: node.src,
                    altText: node.altText || "",
                    caption: node.caption || ""
                });
            } else if (node.children) {
                traverseNodes(node.children);
            }
        });
    }

    if (editorState.root && editorState.root.children) {
        traverseNodes(editorState.root.children);
    }

    return images;
}