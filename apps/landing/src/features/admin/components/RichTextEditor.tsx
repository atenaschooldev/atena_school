"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import DOMPurify from 'isomorphic-dompurify';
import { Bold, Italic, Strikethrough, List, ListOrdered, Image as ImageIcon } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const sanitizeAndDispatch = useCallback((html: string) => {
    const cleanHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 's', 'a', 'br', 'img'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title']
    });
    onChange(cleanHtml);
  }, [onChange]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-full min-h-[150px] px-3 py-2 outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      sanitizeAndDispatch(editor.getHTML());
    },
  });

  // Update content strictly if value changed externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event: any) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const supabase = createClient();
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        
        // Upload to a generic 'public' bucket for uploaded editor images, assuming 'course_images' serves as standard
        const { data, error } = await supabase.storage
          .from('course_images')
          .upload(`blog_inline/${fileName}`, file);

        if (error) {
          console.error("Upload error:", error);
          alert("Impossibile caricare l'immagine.");
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('course_images')
          .getPublicUrl(data.path);

        editor?.chain().focus().setImage({ src: publicUrl }).run();
      } catch (err) {
        console.error(err);
      }
    };
    input.click();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col w-full border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:border-primary transition duration-200">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-1 rounded-t-md">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label="Toggle bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Toggle italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('strike')}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          aria-label="Toggle strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        <div className="w-[1px] h-4 bg-border mx-1" />
        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Toggle bullet list"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Toggle ordered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <div className="w-[1px] h-4 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.preventDefault();
            handleImageUpload();
          }}
          title="Inserisci Immagine"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-1 max-h-[400px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
