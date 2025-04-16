// Function to check the access code
function checkCode() {
    const code = document.getElementById('access-code').value;
    const correctCode = '1234'; // Set the correct code here

    if (code === correctCode) {
        document.getElementById('upload-section').style.display = 'block';  // Show the upload section
    } else {
        alert('Incorrect access code!');  // Alert if the code is wrong
    }
}

// Function to upload the files
function uploadFiles() {
    const files = document.getElementById('fileInput').files;
    if (files.length === 0) {
        alert('Please select files to upload.');
        return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files[]', files[i]);
    }

    // Send the files to the backend server using Fetch API
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('status').textContent = data.message;  // Display success message
    })
    .catch(error => {
        document.getElementById('status').textContent = 'Error uploading files!';
        console.error('Error:', error);
    });
}
document.getElementById('viewButton').addEventListener('click', () => {
    const password = document.getElementById('password').value;

    // Send the password to the server for validation
    fetch('/verify-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // If password is correct, fetch the images
            fetchImages();
        } else {
            alert('Incorrect password!');
        }
    })
    .catch(error => console.error('Error:', error));
});

function fetchImages() {
    // Fetch the list of uploaded images from the server
    fetch('/uploads')
    .then(response => response.json())
    .then(files => {
        const gallery = document.getElementById('imageGallery');
        gallery.innerHTML = ''; // Clear previous images

        files.forEach(file => {
            const img = document.createElement('img');
            img.src = `/uploads/${file}`;
            gallery.appendChild(img);
        });
    })
    .catch(error => console.error('Error:', error));
}
// Event listener for file input change
document.getElementById('file-input').addEventListener('change', function(event) {
    const files = event.target.files; // Get selected files
    const previewContainer = document.getElementById('image-preview-container');
    previewContainer.innerHTML = ''; // Clear previous previews

    // Loop through all selected files
    Array.from(files).forEach(file => {
        if (file && file.type.startsWith('image/')) { // Check if the file is an image
            const reader = new FileReader(); // Create a new FileReader instance
            
            reader.onload = function(e) {
                // Create an image element for preview
                const img = document.createElement('img');
                img.src = e.target.result; // Set the image source as the file data URL
                previewContainer.appendChild(img); // Append image to the preview container
            };
            
            // Read the file as a data URL to create an image preview
            reader.readAsDataURL(file);
        }
    });
});
function uploadFiles() {
    const fileInput = document.getElementById('fileInput');
    const uploadedFilesContainer = document.getElementById('uploadedFiles');

    uploadedFilesContainer.innerHTML = ''; // Clear previous uploads
    Array.from(fileInput.files).forEach(file => {
        const fileUrl = URL.createObjectURL(file);
        
        const link = document.createElement('a');
        link.href = fileUrl;
        link.textContent = file.name;
        link.download = file.name; // Allows downloading when clicked
        link.target = '_blank'; // Opens in a new tab
        uploadedFilesContainer.appendChild(link);
        uploadedFilesContainer.appendChild(document.createElement('br'));
    });
}async function loadUploadedFiles() {
    const uploadedFilesContainer = document.getElementById('uploadedFiles');
    uploadedFilesContainer.innerHTML = '';

    try {
        const response = await fetch('/files');
        const files = await response.json();

        files.forEach(file => {
            const fileUrl =`/uploads/${file}`;

            // Create a link to open the file
            const link = document.createElement('a');
            link.href = fileUrl;
            link.textContent = file;
            link.target = '_blank'; // Open in a new tab
            link.download = file; // Allow downloading
            uploadedFilesContainer.appendChild(link);
            uploadedFilesContainer.appendChild(document.createElement('br'));

            // Create an image or video preview if possible
            if (file.match(/\.(jpg|jpeg|png|gif)$/)) {
                const img = document.createElement('img');
                img.src = fileUrl;
                img.style.width = '100px';
                img.style.margin = '5px';
                uploadedFilesContainer.appendChild(img);
            } else if (file.match(/\.(mp4|webm|ogg)$/)) {
                const video = document.createElement('video');
                video.src = fileUrl;
                video.controls = true;
                video.style.width = '100px';
                video.style.margin = '5px';
                uploadedFilesContainer.appendChild(video);
            }
        });
    } catch (error) {
        console.error('Error loading files:', error);
    }
}
// Remove login page from history after login
history.replaceState(null, null, window.location.href);

// Redirect after login
window.location.replace('/homepage');
document.getElementById('viewFilesButton').addEventListener('click', loadUploadedFiles);