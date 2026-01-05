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
            if (!this.config.multiple) {
                this.closeAll();
            }
            this.open(instance);
        }
    }
    
    open(instance) {
        const { container, header, content, arrow } = instance;
        
        // Добавляем активные классы
        container.classList.add(this.config.activeClass);
        header.classList.add(this.config.activeClass);
        if (arrow) arrow.classList.add(this.config.activeClass);
        content.classList.add(this.config.activeClass);
        
        // Вычисляем высоту контента
        const contentHeight = content.scrollHeight;
        
        // Устанавливаем начальную высоту
        content.style.maxHeight = '0px';
        
        // Анимация открытия
        setTimeout(() => {
            content.style.maxHeight = `${contentHeight}px`;
        }, 10);
        
        // Обновляем ARIA
        header.setAttribute('aria-expanded', 'true');
        content.setAttribute('aria-hidden', 'false');
        
        instance.isOpen = true;
        
        // После анимации убираем фиксированную высоту
        setTimeout(() => {
            if (content.style.maxHeight !== '0px') {
                content.style.maxHeight = 'none';
            }
        }, this.config.duration);
    }
    
    close(instance) {
        const { container, header, content, arrow } = instance;
        
        // Сохраняем текущую высоту
        const contentHeight = content.scrollHeight;
        content.style.maxHeight = `${contentHeight}px`;
        
        // Анимация закрытия
        setTimeout(() => {
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
            }, this.config.duration);
        }, 10);
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
    
    openById(id) {
        const instance = this.instances.find(inst => inst.id === id);
        if (instance && !instance.isOpen) {
            this.open(instance);
        }
    }
    
    closeById(id) {
        const instance = this.instances.find(inst => inst.id === id);
        if (instance && instance.isOpen) {
            this.close(instance);
        }
    }
    
    destroy() {
        this.instances.forEach(instance => {
            const { header } = instance;
            header.removeEventListener('click', this.toggle);
            header.removeEventListener('keydown', this.handleKeydown);
        });
        this.instances = [];
    }
}

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.collapseWidget = new CollapseWidget({
        multiple: true,
        initOpen: false
    });
});

export default CollapseWidget;