import MonacoEditor from '@/lib/components/monaco';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

//https://github.com/supabase/supabase/blob/master/apps/studio/components/interfaces/SQLEditor/SQLEditor.tsx
type ContentDiff = {
    original: string
    modified: string
}

export default function Root() {
    const [sqlDiff, setSqlDiff] = useState<ContentDiff>()
    const isDiffOpen = !!sqlDiff
    return (
        <div className="flex-grow overflow-y-auto border-b">
            <motion.div

                variants={{
                    visible: {
                        opacity: 1,
                        filter: 'blur(0px)',
                    },
                    hidden: {
                        opacity: 0,
                        filter: 'blur(10px)',
                    },
                }}
                initial="hidden"
                animate={isDiffOpen ? 'hidden' : 'visible'}
                className="w-full h-full"
            >
                <MonacoEditor
                    value={sqlDiff?.original || ''}
                    language='sql'
                // autoFocus
                // id={id}
                // editorRef={editorRef}
                // monacoRef={monacoRef}
                // executeQuery={executeQuery}
                // onHasSelection={setHasSelection}
                />
            </motion.div></div>
    );
}