import { Suspense, use, useMemo, useState, useTransition } from "react";

const generateRandomHexString = (length: number) => {
  const lengthInBytes = Math.ceil(length / 2);
  const randomValues = new Uint8Array(lengthInBytes);
  crypto.getRandomValues(randomValues);

  return randomValues.toHex();
};
const textDecoder = new TextDecoder();

const Textarea = ({
  textPromise,
  onTextChange,
}: {
  textPromise: Promise<string>;
  onTextChange: (text: string) => void;
}) => {
  const initialText = use(textPromise);
  const [text, setText] = useState(initialText);

  return (
    <textarea
      value={text}
      onChange={(e) => {
        e.preventDefault();
        setText(e.target.value);
        onTextChange(e.target.value);
      }}
      style={{ fieldSizing: "content" }}
    />
  );
};

const App = () => {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [isPending, startTransition] = useTransition();
  const blobTextPromise = useMemo(
    () => blob?.bytes().then((bytes) => textDecoder.decode(bytes)),
    [blob],
  );
  const [currText, setCurrText] = useState("");

  return (
    <div>
      <button
        data-testid="save-button"
        data-pending={!!isPending}
        onClick={(e) => {
          e.preventDefault();
          const newBlob = new Blob([currText]);
          startTransition(async () => {
            console.log(new Date().toISOString(), "- Promise starts");
            try {
              const newHandle = await showSaveFilePicker();
              const writableStream = await newHandle.createWritable();
              await writableStream.write(newBlob);
              await writableStream.close();
            } catch (e) {
              if (e instanceof DOMException && e.name === "AbortError") {
                console.error(new Date().toISOString(), "- Aborted!", e);
              } else {
                throw e;
              }
            } finally {
              console.log(new Date().toISOString(), "- Promise concluded");
            }
            startTransition(() => {
              setBlob(newBlob);
            });
          });
        }}
      >
        Save blob
      </button>
      <button
        data-testid="initialize-blob"
        onClick={(e) => {
          e.preventDefault();
          setBlob(new Blob([generateRandomHexString(1000)]));
        }}
      >
        Initialize blob
      </button>
      {blobTextPromise !== undefined ? (
        <Suspense fallback="Suspending...">
          <Textarea textPromise={blobTextPromise} onTextChange={setCurrText} />
        </Suspense>
      ) : null}
    </div>
  );
};

export { App };
