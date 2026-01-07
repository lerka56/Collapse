import './styles.css';

class CollapseWidget {
    constructor(options = {}) {
        this.defaults = {
            selector: '.collapse-container',
            activeClass: 'active',
            duration: 300,
            multiple: false, // Можно открывать несколько одновременно
            initOpen: false // Открыть при инициализации
        };
        
        this.config = { ...this.defaults, ...options };
        this.instances = [];
        this.activeInstance = null;
        this.init();
    }
    
    init() {
        this.containers = document.querySelectorAll(this.config.selector);
        
        this.containers.forEach((container, index) => {
            this.setupInstance(container, index);
        });
        
        console.log(`Collapse Widget инициализирован: ${this.instances.length} элементов`);
    }
    
    setupInstance(container, index) {
        const header = container.querySelector('.collapse-header');
        const content = container.querySelector('.collapse-content');
        const arrow = container.querySelector('.collapse-arrow');
        
        if (!header || !content) return;
        
        const instance = {
            container,
            header,
            content,
            arrow,
            isOpen: false,
            id: `collapse-${index}`
        };
        
        // Устанавливаем ARIA атрибуты
        this.setupAccessibility(instance, index);
        
        // Добавляем обработчики событий
        this.addEventListeners(instance);
        
        // Открываем если нужно
        if (this.config.initOpen) {
            this.open(instance);
        }
        
        this.instances.push(instance);
    }
    
    setupAccessibility(instance, index) {
        const { header, content } = instance;
        
        header.setAttribute('id', `collapse-header-${index}`);
        header.setAttribute('aria-expanded', 'false');
        header.setAttribute('aria-controls', `collapse-content-${index}`);
        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        
        content.setAttribute('id', `collapse-content-${index}`);
        content.setAttribute('aria-labelledby', `collapse-header-${index}`);
        content.setAttribute('aria-hidden', 'true');
    }
    
    addEventListeners(instance) {
        const { header } = instance;
        
        // Клик
        header.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle(instance);
        });
        
        // Клавиатура
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle(instance);
            }
        });
    }
    
    toggle(instance) {
        if (instance.isOpen) {
            this.close(instance);
        } else {
            this.open(instance);
        }
    }
    
    open(instance) {
        // Закрываем активный виджет если не разрешено множественное открытие
        if (!this.config.multiple && this.activeInstance && this.activeInstance !== instance) {
            this.close(this.activeInstance);
        }
        
        const { container, header, content, arrow } = instance;
        
        // Анимация открытия
        const startAnimation = () => {
            content.style.maxHeight = '0px';
            
            requestAnimationFrame(() => {
                const contentHeight = content.scrollHeight;
                content.style.maxHeight = `${contentHeight}px`;
                
                // Добавляем активные классы
                container.classList.add(this.config.activeClass);
                header.classList.add(this.config.activeClass);
                if (arrow) arrow.classList.add(this.config.activeClass);
                content.classList.add(this.config.activeClass);
                
                // Обновляем ARIA
                header.setAttribute('aria-expanded', 'true');
                content.setAttribute('aria-hidden', 'false');
                
                instance.isOpen = true;
                this.activeInstance = instance;
                
                // После анимации убираем фиксированную высоту
                setTimeout(() => {
                    if (content.style.maxHeight !== '0px') {
                        content.style.maxHeight = 'none';
                    }
                }, this.config.duration);
            });
        };
        
        // Если контент уже имеет высоту, сначала сбрасываем
        if (content.style.maxHeight && content.style.maxHeight !== '0px') {
            content.style.maxHeight = `${content.scrollHeight}px`;
            setTimeout(startAnimation, 10);
        } else {
            startAnimation();
        }
    }
    
    close(instance) {
        const { container, header, content, arrow } = instance;
        
        // Анимация закрытия
        const startAnimation = () => {
            const contentHeight = content.scrollHeight;
            content.style.maxHeight = `${contentHeight}px`;
            
            requestAnimationFrame(() => {
                content.style.maxHeight = '0px';
                
                setTimeout(() => {
                    // Убираем активные классы
                    container.classList.remove(this.config.activeClass);
                    header.classList.remove(this.config.activeClass);
                    if (arrow) arrow.classList.remove(this.config.activeClass);
                    content.classList.remove(this.config.activeClass);
                    
                    // Обновляем ARIA
                    header.setAttribute('aria-expanded', 'false');
                    content.setAttribute('aria-hidden', 'true');
                    
                    instance.isOpen = false;
                    if (this.activeInstance === instance) {
                        this.activeInstance = null;
                    }
                }, this.config.duration);
            });
        };
        
        startAnimation();
    }
    
    closeAll() {
        this.instances.forEach(instance => {
            if (instance.isOpen) {
                this.close(instance);
            }
        });
    }
    
    openAll() {
        this.instances.forEach(instance => {
            if (!instance.isOpen) {
                this.open(instance);
            }
        });
    }
}

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.collapseWidget = new CollapseWidget({
        multiple: false, // Только один открытый виджет
        initOpen: true // Открыть первый при загрузке
    });
});

export default CollapseWidget;