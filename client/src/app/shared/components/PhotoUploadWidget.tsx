import { CloudUpload } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { type Coordinates, type CropperRef, Cropper, CropperPreview, RectangleStencil } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import Grid from "@mui/material/Grid";

type Props ={ 
  uploadPhoto: (file: Blob) => void;
  loading: boolean;
}


export default function PhotoUploadWidget({ uploadPhoto, loading }: Props) {
  const [files, setFiles] = useState<object & { preview: string }[]>([]);
  const cropperRef = useRef<CropperRef>(null);
  const [, setCoordinates] = useState<Coordinates | null>(null); 

  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    }
  }, [files]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file as Blob),
        })
      )
    );
  }, []);

 const onCrop = useCallback(() => {
   const canvas = cropperRef.current?.getCanvas(); 
   if (!canvas) return;

   canvas.toBlob((blob) => {
     if (!blob) return;
     uploadPhoto(blob);
   }, "image/jpeg"); 
 }, [uploadPhoto]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="overline" color="secondary">
          Step 1 - Add Photo
        </Typography>
        <Box
          {...getRootProps()}
          sx={{
            border: "dashed 3px #eee",
            borderColor: isDragActive ? "green" : "#eee",
            borderRadius: "5px",
            position: "relative",
            zIndex: 1,
            paddingTop: "30px",
            textAlign: "center",
            height: "280px",
            cursor: "pointer",
          }}
          //   onClick={() => console.log("clicked")}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 80 }} />
          <Typography variant="h6">
            {isDragActive
              ? "Drop the image here"
              : "Drag & drop, or click to select"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            PNG, JPG, GIF (max ~ your limit)
          </Typography>
        </Box>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="overline" color="secondary">
          Step 2 - Resize image
        </Typography>
        {files[0]?.preview && (
          <Cropper
            ref={cropperRef}
            src={files[0]?.preview}
            className="cropper"
            style={{
              height: 300,
              width: "90%",
            }}
            stencilComponent={RectangleStencil}
            stencilProps={{ aspectRatio: 1, movable: true, resizable: true }}
            onChange={(cropper) => {
              setCoordinates(cropper.getCoordinates());
            }}
          />
        )}
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        {files[0]?.preview && (
          <>
            <Typography variant="overline" color="secondary">
              Step 3 - Preview & Upload
            </Typography>
            <CropperPreview
              cropper={cropperRef}
              // coordinates={coordinates}
              style={{
                // position: "relative",
                // zIndex: 1,
                width: 300,
                height: 300,
                overflow: "hidden",
              }}
              className="img-preview"
            />
          <Button
              sx={{
                my: 1,
                width: 300,
              }}
              onClick={onCrop}
              variant="contained"
              color="secondary"
              disabled={loading}
            >
              Upload

            </Button>
          </>
        )}
      </Grid>
    </Grid>
  );
}
