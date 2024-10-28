import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './Exercise.css';

Modal.setAppElement('#root');

const Exercise = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedExerciseId, setSelectedExerciseId] = useState(null);
    const [errors, setErrors] = useState({});

    // State for new/existing exercise form
    const [exerciseForm, setExerciseForm] = useState({
        title: '',
        description: '',
        type: '',
        media_url: null,
    });

    const types = [
        { id: 1, label: 'Meditation' },
        { id: 2, label: 'Deep Breathing' },
        { id: 3, label: 'Yoga' },
    ];

    const fetchExercises = async (currentPage) => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/exercises`, {
                params: { page: currentPage, limit: 20 },
            });
            setExercises(response.data.exercises);
            setTotalPages(response.data.total_page);
        } catch (error) {
            console.error("Error fetching exercises:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExercises(page);
    }, [page]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const openModal = (isEdit = false, exerciseId = null) => {
        setIsModalOpen(true);
        setIsEditMode(isEdit);
        setSelectedExerciseId(exerciseId);
        if (isEdit && exerciseId) {
            fetchExerciseDetails(exerciseId);
        } else {
            resetForm();
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
        setErrors({});
    };

    const resetForm = () => {
        setExerciseForm({
            title: '',
            description: '',
            type: '',
            media_url: null,
        });
    };

    const fetchExerciseDetails = async (exerciseId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/exercises/${exerciseId}/detail`);
            setExerciseForm(response.data);
        } catch (error) {
            console.error("Error fetching exercise details:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setExerciseForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setExerciseForm((prev) => ({ ...prev, media_url: e.target.files[0] }));
    };

    const handleSaveExercise = async () => {
        const formData = new FormData();
        Object.keys(exerciseForm).forEach((key) => {
            formData.append(key, exerciseForm[key]);
        });

        const url = isEditMode
            ? `${process.env.REACT_APP_API_URL}/exercises/update/${selectedExerciseId}`
            : `${process.env.REACT_APP_API_URL}/exercises/create`;

        try {
            const response = await axios({
                method: 'post',
                url: url,
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status === 200 || response.status === 201) {
                closeModal();
                fetchExercises(page);
            } else {
                console.error("Unexpected response status:", response.status);
            }
        } catch (error) {
            console.error("Error saving exercise:", error);
            if (error.response && error.response.status === 400) {
                setErrors(error.response.data.errors || { error: error.response.data.error });
            } else {
                setErrors({ error: "Failed to save exercise. Please try again later." });
            }
        }
    };

    return (
        <div className="exercise-container">
            <div className="exercise-header">
                <h2>Exercises</h2>
                <button className="create-button" onClick={() => openModal()}>Create</button>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Media</th>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exercises.map((exercise) => (
                                <tr key={exercise.id}>
                                    <td>{exercise.id}</td>
                                    <td>
                                        <video src={exercise.media_url} controls className="media" />
                                    </td>
                                    <td>{exercise.title}</td>
                                    <td>{exercise.type_string}</td>
                                    <td>{exercise.description}</td>
                                    <td>
                                        <button className="edit-button" onClick={() => openModal(true, exercise.id)}>Edit</button>
                                        <button className="delete-button">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination">
                        <button onClick={() => handlePageChange(1)}>First</button>
                        <button onClick={() => handlePageChange(page - 1)}>Previous</button>
                        {[...Array(totalPages)].slice(page - 1, page + 4).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handlePageChange(page + index)}
                                className={page === page + index ? 'active' : ''}
                            >
                                {page + index}
                            </button>
                        ))}
                        <button onClick={() => handlePageChange(page + 1)}>Next</button>
                        <button onClick={() => handlePageChange(totalPages)}>Last</button>
                    </div>
                </>
            )}

            <Modal isOpen={isModalOpen} onRequestClose={closeModal} className="modal">
                <h2>{isEditMode ? 'Edit Exercise' : 'Add New Exercise'}</h2>
                <form>
                    <label>
                        Title:
                        <input type="text" name="title" value={exerciseForm.title} onChange={handleInputChange} />
                        {errors.title && <span className="error">{errors.title}</span>}
                    </label>
                    <label>
                        Type:
                        <select name="type" value={exerciseForm.type} onChange={handleInputChange}>
                            <option value="">Select Type</option>
                            {types.map((type) => (
                                <option key={type.id} value={type.id}>{type.label}</option>
                            ))}
                        </select>
                        {errors.type && <span className="error">{errors.type}</span>}
                    </label>
                    <label>
                        Description:
                        <textarea name="description" value={exerciseForm.description} onChange={handleInputChange} />
                        {errors.description && <span className="error">{errors.description}</span>}
                    </label>
                    <label>
                        Media:
                        <input type="file" name="media_url" onChange={handleFileChange} />
                    </label>
                    {errors.error && <span className="error">{errors.error}</span>}
                    <button type="button" onClick={handleSaveExercise}>{isEditMode ? 'Update' : 'Create'}</button>
                    <button type="button" onClick={closeModal}>Cancel</button>
                </form>
            </Modal>
        </div>
    );
};

export default Exercise;
