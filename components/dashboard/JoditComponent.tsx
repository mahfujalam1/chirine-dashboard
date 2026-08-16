"use client";

import { memo, useRef, useEffect, useState, useMemo } from "react";
import JoditEditor from "jodit-react";

const JoditComponent = ({ content, setContent }: { content: string, setContent: (content: string) => void }) => {
  const editor = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
    return () => setIsReady(false);
  }, []);

  const config = useMemo(
    () => ({
      readonly: false,
      toolbarSticky: false,
      minHeight: 500,
      buttons: [
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'ul',
        'ol',
        'outdent',
        'indent',
        'font',
        'fontsize',
        'brush',
        'paragraph',
        'image',
        'table',
        'link',
        'align',
        'undo',
        'redo',
        'hr',
        'eraser',
        'copyformat',
        'fullsize',
        'preview',
      ],
      uploader: {
        insertImageAsBase64URI: true,
      },
      style: {
        fontFamily: 'inherit',
        fontSize: '16px',
      },
    }),
    []
  );

  const memoizedEditor = useMemo(
    () => (
      <JoditEditor
        ref={editor}
        value={content || ""}
        onChange={(newContent) => setContent(newContent)}
        onBlur={(newContent) => setContent(newContent)}
        config={config}
        tabIndex={1}
      />
    ),
    [content, config, setContent]
  );

  if (!isReady) {
    return <div className="h-40 bg-gray-100 rounded animate-pulse"></div>;
  }

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">{memoizedEditor}</div>
  );
};

export default memo(JoditComponent);
