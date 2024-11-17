import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './Expert.css';

Modal.setAppElement('#root');

const Expert = () => {
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedExpertId, setSelectedExpertId] = useState(null);
    const [errors, setErrors] = useState({});

    // State for new/existing expert form
    const [expertForm, setExpertForm] = useState({
        name: '',
        specialization: 0,
        bio: '',
        contact_info: '',
        phone_number: '',
        avatar: null,
    });

    const specializations = [
        { id: 1, label: 'Clinical Psychology' },
        { id: 2, label: 'Psychiatry' },
        { id: 3, label: 'Counseling' },
        { id: 4, label: 'Behavioral Therapy' },
        { id: 5, label: 'Family & Marriage' },
        { id: 6, label: 'Art & Music' },
    ];

    const fetchExperts = async (currentPage) => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/experts`, {
                params: { page: currentPage, limit: 20 },
            });
            setExperts(response.data.experts);
            setTotalPages(response.data.total_page);
        } catch (error) {
            console.error("Error fetching experts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExperts(page);
    }, [page]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const openModal = (isEdit = false, expertId = null) => {
        setIsModalOpen(true);
        setIsEditMode(isEdit);
        setSelectedExpertId(expertId);
        if (isEdit && expertId) {
            fetchExpertDetails(expertId);
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
        setExpertForm({
            name: '',
            specialization: 0,
            bio: '',
            contact_info: '',
            phone_number: '',
            avatar: null,
        });
    };

    const fetchExpertDetails = async (expertId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/experts/${expertId}/detail`);
            setExpertForm(response.data);
        } catch (error) {
            console.error("Error fetching expert details:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setExpertForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setExpertForm((prev) => ({ ...prev, avatar: e.target.files[0] }));
    };

    const handleSaveExpert = async () => {
        const formData = new FormData();
        Object.keys(expertForm).forEach((key) => {
            formData.append(key, expertForm[key]);
        });

        const url = isEditMode
            ? `${process.env.REACT_APP_API_URL}/experts/update/${selectedExpertId}`
            : `${process.env.REACT_APP_API_URL}/experts/create`;

        try {
            const response = await axios({
                method: 'post',
                url: url,
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status === 200 || response.status === 201) {
                closeModal();
                fetchExperts(page);
            } else {
                console.error("Unexpected response status:", response.status);
            }
        } catch (error) {
            console.error("Error saving expert:", error);
            if (error.response && error.response.status === 400) {
                setErrors(error.response.data.errors || { error: error.response.data.error });
            } else {
                setErrors({ error: "Failed to save expert. Please try again later." });
            }
        }
    };

    return (
        <div className="expert-container">
            <div className="expert-header">
                <h2>Experts</h2>
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
                                <th>Avatar</th>
                                <th>Name</th>
                                <th>Specialization</th>
                                <th>Bio</th>
                                <th>Contact Info</th>
                                <th>Phone Number</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {experts.map((expert) => (
                                <tr key={expert.id}>
                                    <td>{expert.id}</td>
                                    <td>
                                        <img src={expert.avatar} alt="Avatar" className="avatar" />
                                    </td>
                                    <td>{expert.name}</td>
                                    <td>{expert.specialization_string}</td>
                                    <td>{expert.bio}</td>
                                    <td>{expert.contact_info}</td>
                                    <td>{expert.phone_number}</td>
                                    <td>
                                        <button className="edit-button" onClick={() => openModal(true, expert.id)}>Edit</button>
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
                <h2>{isEditMode ? 'Edit Expert' : 'Add New Expert'}</h2>
                <form>
                    <label>
                        Name:
                        <input type="text" name="name" value={expertForm.name} onChange={handleInputChange} />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </label>
                    <label>
                        Specialization:
                        <select name="specialization" value={expertForm.specialization} onChange={handleInputChange}>
                            <option value="">Select Specialization</option>
                            {specializations.map((spec) => (
                                <option key={spec.id} value={spec.id}>{spec.label}</option>
                            ))}
                        </select>
                        {errors.specialization && <span className="error">{errors.specialization}</span>}
                    </label>
                    <label>
                        Bio:
                        <textarea name="bio" value={expertForm.bio} onChange={handleInputChange} />
                        {errors.bio && <span className="error">{errors.bio}</span>}
                    </label>
                    <label>
                        Contact Info:
                        <input type="text" name="contact_info" value={expertForm.contact_info} onChange={handleInputChange} />
                        {errors.contact_info && <span className="error">{errors.contact_info}</span>}
                    </label>
                    <label>
                        Phone Number:
                        <input type="text" name="phone_number" value={expertForm.phone_number} onChange={handleInputChange} />
                        {errors.phone_number && <span className="error">{errors.phone_number}</span>}
                    </label>
                    <label>
                        Avatar:
                        <input type="file" name="avatar" onChange={handleFileChange} />
                    </label>
                    {errors.error && <span className="error">{errors.error}</span>}
                    <button type="button" onClick={handleSaveExpert}>{isEditMode ? 'Update' : 'Create'}</button>
                    <button type="button" onClick={closeModal}>Cancel</button>
                </form>
            </Modal>
        </div>
    );
};

export default Expert;
